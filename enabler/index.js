import { Enabler } from "/src/main.ts";

async function fetchDevJwt() {
  const response = await fetch("http://localhost:9002/jwt/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      iss: "https://issuer.com",
      sub: "test-sub",
      "https://issuer.com/claims/project_key": `${__VITE_CTP_PROJECT_KEY__}`,
    }),
  });
  return (await response.json()).token;
}

const methodsStore = new Map();
// Maps processor payment method types to stored builder type names
const STORED_TYPE_MAP = {
  card: "card",
};
// Vaulting (storePaymentDetails) is only supported end-to-end for CardFields — see CLAUDE.md's
// "Stored payment methods (vaulted credit cards)" section. getSupportedPaymentComponents()
// reports components by their commercetools icon key (toPaymentMethodIconKey), not the internal
// PaymentMethodType name, so CardFields shows up here as "card".
const ALLOW_STORE_PAYMENT_METHOD_TYPES = ["card"];

const btnLoadOthers = document.getElementById("loadComponents");
const btnClear = document.getElementById("clearComponents");
const btnLoadStored = document.getElementById("loadStoredMethods");
const spinner = document.getElementById("spinner");
const methodsContainer = document.getElementById("paymentMethods-container");
const containerExternal = document.getElementById("container--external");
const containerInternal = document.getElementById("container--internal");

function showSpinner() {
  spinner.classList.remove("d-none");
}
function hideSpinner() {
  spinner.classList.add("d-none");
}

function clearUI() {
  methodsStore.clear();
  methodsContainer.innerHTML = "";
  containerExternal.innerHTML = "";
  containerInternal.innerHTML = "";
  document
    .getElementById("storePaymentMethod-container")
    .classList.add("d-none");
  document
    .getElementById("removeStorePaymentMethod-container")
    .classList.add("d-none");
}

function createRadioForMethod(methodId, label) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-check";
  const input = document.createElement("input");
  input.className = "form-check-input";
  input.type = "radio";
  input.name = "paymentMethodRadio";
  input.id = `pm-radio-${methodId}`;
  input.value = methodId;
  const lbl = document.createElement("label");
  lbl.className = "form-check-label";
  lbl.htmlFor = input.id;
  lbl.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(lbl);
  methodsContainer.appendChild(wrapper);
  input.addEventListener("change", (e) => onMethodSelected(methodId));
}

async function onMethodSelected(methodId) {
  const method = methodsStore.get(methodId);
  if (!method) return;
  containerExternal.innerHTML = "";
  containerInternal.innerHTML = "";

  const storeContainer = document.getElementById(
    "storePaymentMethod-container",
  );
  const storeCheckbox = document.getElementById("storePaymentMethod");
  const canStorePaymentMethod =
    method.category === "component" &&
    ALLOW_STORE_PAYMENT_METHOD_TYPES.includes(method.type);
  storeContainer.classList.toggle("d-none", !canStorePaymentMethod);
  storeCheckbox.checked = false;

  const builder = method.builder;
  const component = method.component;
  if (builder.componentHasSubmit) {
    await component.mount("#container--external");
    const customButton = document.createElement("button");
    customButton.textContent = "Pay with " + methodId.split("-")[1];
    customButton.className = "btn btn-lg btn-primary btn-block mt-3";
    customButton.addEventListener("click", async () => {
      const storePM = document.getElementById("storePaymentMethod")?.checked;
      await component.submit({ storePaymentDetails: !!storePM });
    });
    containerInternal.appendChild(customButton);
  } else {
    await component.mount("#container--external");
  }
}

async function loadMethods() {
  clearUI();
  showSpinner();
  const cartId = document.getElementById("cartId").value.trim();
  if (!cartId) {
    hideSpinner();
    return alert("Enter cart ID");
  }

  const token = await fetchDevJwt();
  const res = await fetch(
    `${__VITE_PROCESSOR_URL__}/operations/payment-components`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const paymentMethods = await res.json();
  const sessionId = await getSessionId(cartId);

  const enabler = new Enabler({
    processorUrl: __VITE_PROCESSOR_URL__,
    sessionId,
  });

  async function registerMethod(category, type, meta) {
    const methodId = `${category}-${type}`;
    let builder;
    if (category === "express") builder = await enabler.createExpressBuilder(type);
    else if (category === "component") builder = await enabler.createComponentBuilder(type);
    const component = await builder.build({
      showPayButton: !builder.componentHasSubmit,
      ...(builder.componentHasSubmit
        ? {}
        : {
            onPayButtonClick: async () => Promise.resolve(true),
          }),
      ...(category === "express"
        ? {
            initialAmount: {
              centAmount: 2000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          }
        : {}),
    });
    methodsStore.set(methodId, {
      id: methodId,
      type,
      category,
      meta,
      enabler,
      builder,
      component,
    });
  }

  for (const m of paymentMethods.components)
    await registerMethod("component", m.type, m);
  for (const m of paymentMethods.express)
    await registerMethod("express", m.type, m);

  methodsContainer.innerHTML = "";
  for (const [methodId, method] of methodsStore.entries())
    createRadioForMethod(
      methodId,
      `${method.category === "express" ? "Buy Now " : ""}${method.type}`,
    );

  const firstRadio = document.querySelector('input[name="paymentMethodRadio"]');
  if (firstRadio) {
    firstRadio.checked = true;
    firstRadio.dispatchEvent(new Event("change"));
  }
  hideSpinner();
}

btnLoadOthers.addEventListener("click", (e) => {
  e.preventDefault();
  loadMethods();
});

btnLoadStored?.addEventListener("click", async (e) => {
  e.preventDefault();
  clearUI();
  const cartId = document.getElementById("cartId").value.trim();
  if (!cartId) return alert("Enter cart ID");

  showSpinner();
  const sessionId = await getSessionId(cartId);
  const enabler = new Enabler({
    processorUrl: __VITE_PROCESSOR_URL__,
    sessionId,
  });

  const { storedPaymentMethods = [] } = await enabler.getStoredPaymentMethods({
    allowedMethodTypes: Object.keys(STORED_TYPE_MAP),
  });

  const eligibleMethods = storedPaymentMethods.filter(
    (m) => STORED_TYPE_MAP[m.type],
  );

  if (!eligibleMethods.length) {
    containerExternal.innerHTML = "<p>No stored payment methods found.</p>";
    hideSpinner();
    return;
  }

  for (const method of eligibleMethods) {
    const builderType = STORED_TYPE_MAP[method.type];
    const builder = await enabler.createStoredPaymentMethodBuilder(builderType);

    const brand = method.displayOptions?.brand?.key;
    const label = `${builderType}${method.displayOptions?.endDigits ? " ****" + method.displayOptions.endDigits : ""}`;

    const component = builder.build({
      id: method.id,
      brands: brand ? [brand] : [],
      showPayButton: !builder.componentHasSubmit,
    });

    const wrapper = document.createElement("div");
    wrapper.className = "mb-4";
    const heading = document.createElement("h5");
    heading.textContent = `Stored ${label}`;
    wrapper.appendChild(heading);
    const mountTarget = document.createElement("div");
    mountTarget.id = `stored-${method.id}-container`;
    wrapper.appendChild(mountTarget);
    containerExternal.appendChild(wrapper);
    await component.mount(`#stored-${method.id}-container`);

    const payBtn = document.createElement("button");
    payBtn.textContent = `Pay with saved ${label}`;
    payBtn.className = "btn btn-lg btn-primary btn-block mt-3";
    payBtn.addEventListener("click", async () => {
      await component.submit({ storePaymentDetails: false });
    });
    containerInternal.appendChild(payBtn);
  }

  const deleteSection = document.createElement("div");
  deleteSection.className = "mt-4";
  const deleteHeading = document.createElement("h6");
  deleteHeading.textContent = "Remove stored method:";
  deleteSection.appendChild(deleteHeading);
  for (const method of storedPaymentMethods) {
    const endDigits = method.displayOptions?.endDigits;
    const label = `${method.type}${endDigits ? " ****" + endDigits : ""}`;
    const row = document.createElement("div");
    row.className = "d-flex align-items-center mb-2";
    const nameSpan = document.createElement("span");
    nameSpan.className = "mr-3";
    nameSpan.textContent = label;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Remove";
    deleteBtn.className = "btn btn-danger btn-sm";
    deleteBtn.addEventListener("click", async () => {
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Removing...";
      const res = await fetch(
        `${__VITE_PROCESSOR_URL__}/stored-payment-methods/${method.id}`,
        {
          method: "DELETE",
          headers: { "X-Session-Id": sessionId },
        },
      );
      if (res.ok) {
        row.remove();
      } else {
        deleteBtn.disabled = false;
        deleteBtn.textContent = "Remove";
        alert("Failed to remove stored method");
      }
    });
    row.appendChild(nameSpan);
    row.appendChild(deleteBtn);
    deleteSection.appendChild(row);
  }
  containerInternal.appendChild(deleteSection);

  hideSpinner();
});

btnClear.addEventListener("click", (e) => {
  e.preventDefault();
  clearUI();
});
