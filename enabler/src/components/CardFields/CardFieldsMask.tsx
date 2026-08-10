import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PayPalCardFieldsProvider,
  PayPalNameField,
  PayPalNumberField,
  PayPalCVVField,
  PayPalExpiryField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import type { CardFieldsOnApproveData } from "@paypal/paypal-js";
import type {
  PayPalCardFieldsComponent,
  RegisteredFields,
} from "@paypal/react-paypal-js";

import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";
import {
  ApproveVaultSetupTokenData,
  CardFieldsProps,
  CustomOnApproveData,
} from "../../types";
import {
  applyFieldValidationClasses,
  CARD_FIELDS_INPUTS,
  CARD_FIELDS_PAY_BUTTON,
} from "./constants";
import { useNotifications } from "../../app/useNotifications";
import { useLoader } from "../../app/useLoader";
import { errorFunc } from "../errorNotification";
import { useTranslation } from "react-i18next";
import { Card } from "../PaymentTokens/Card";

/*
This section explains internal changes in the CardFieldsMask necessary to make it checkout compatible.
This is code review/certification purposes only.

The top level component <CardFields /> still accepts all pre-existing props and can be used as-is
for merchants intending to self-host the former npm components. Using the connector in the checkout mode
doesn't even need this props as it is handled through commercetools checkout sdk or processor configuration.

This component runs in one of two modes, decided purely by whether `onRegisterSubmit` was
passed in — there is no separate prop/flag for it, and no other part of this file branches on
anything else to tell the two apart.

Checkout mode (onRegisterSubmit is set): the component is mounted inside commercetools
Checkout, via `enabler.createComponentBuilder("CardFields")` -> `PayPalBuilder.ts`. Checkout
renders its own single "Pay" button for the whole page and drives every mounted payment
component from there through the `PaymentComponent` contract
(`payment-enabler/interfaces/enabler.ts`) — it calls `component.submit()`/`isValid()`/
`showValidation()` itself rather than the component showing its own button. To support that:
  - No internal Pay/Save button is rendered. Instead, once the PayPal Card Fields SDK is ready
    (`cardFieldsForm` becomes non-null), this component calls `onRegisterSubmit`/
    `onRegisterValidation` to hand `submit`/`isValid`/`showValidation` implementations up to
    `PayPalBuilder.ts`'s `PayPalComponent`, which is what Checkout actually holds a reference to.
  - No saved-card selection UI (the vaulted-card radio table / "Add a new card" toggle) is
    shown either. Checkout has its own separate stored-payment-methods component for choosing
    and paying with an already-saved card, so this component only ever collects a *new* card's
    details in this mode — it goes straight to the entry fields.
  - A "save this card" intent can come from the host itself (the `storePaymentDetails` argument
    Checkout passes to `submit()`), which gets OR'd together with this component's own "save
    this card for future purchases" checkbox (`shouldStoreInVault()`) — either one is enough.

Legacy/self-hosted mode (onRegisterSubmit is undefined): there is no host page driving
submission externally, matching how the old standalone `paypal-commercetools-client` package's
equivalent component worked (mount it directly and it's fully self-sufficient). To support that:
  - The component renders its own internal Pay/Save button (see `!onRegisterSubmit` below), and
    that button is what triggers `cardFieldsForm.submit()` — nothing external ever calls
    `submit()`/`isValid()`/`showValidation()` on it.
  - The saved-card radio table + "Add a new card" toggle ARE shown, since there's no separate
    stored-payment-methods component for a self-hosting merchant to delegate that to instead.

`vaultOnly` (`usePayment()`'s flag for "this component is being used purely to save a card, with
no payment at all") is legacy-mode-only: it only ever takes effect when `onRegisterSubmit` is
undefined. Checkout doesn't support a standalone "vault only" flow — it only supports paying,
optionally *with* vaulting the card at the same time (the "save this card for future purchases"
checkbox / `storePaymentDetails`, both folded into `storeInVault`/`saveCard` on the normal
pay flow below). So in Checkout mode `vaultOnly` is forced off (see `vaultOnly` below), even if
`createVaultSetupTokenUrl`/`approveVaultSetupTokenUrl` were mistakenly supplied for it — a
save-only flow there would have to go through a separate stored-payment-methods component/
builder instead, not through `CardFields`.*/

type CardFieldsState = {
  form: PayPalCardFieldsComponent | null;
  fields: RegisteredFields;
};

// usePayPalCardFields() only works inside <PayPalCardFieldsProvider/>'s own subtree, and
// CardFieldsMask is what renders that provider — so it can't call the hook itself. This is the
// only reason a child component exists at all: its sole job is to pipe the hook's value up into
// CardFieldsMask's own state so the actual submit/validation logic can live there instead of
// being split across a separate component.
const CardFieldsFormSync: React.FC<{
  onChange: (state: CardFieldsState) => void;
}> = ({ onChange }) => {
  const { cardFieldsForm, fields } = usePayPalCardFields();
  useEffect(() => {
    onChange({ form: cardFieldsForm, fields });
  }, [cardFieldsForm, fields]);
  return null;
};

export const CardFieldsMask: React.FC<CardFieldsProps> = ({
  enableVaulting,
  onRegisterSubmit,
  onRegisterValidation,
}) => {
  const {
    handleCreateOrder,
    handleOnApprove,
    handleAuthenticateThreeDSOrder,
    vaultOnly: paymentVaultOnly,
    handleApproveVaultSetupToken,
    handleCreateVaultSetupToken,
    orderDataLinks,
    orderId,
  } = usePayment();
  const { settings, paymentTokens } = useSettings();
  const { notify } = useNotifications();
  const { isLoading } = useLoader();
  const { t } = useTranslation();

  // vaultOnly (save-a-card-only, no payment) is a legacy/self-hosted-only concept — Checkout only
  // supports paying, optionally with vaulting alongside it, never a standalone save-only flow.
  // So this component ignores vaultOnly whenever it's driven externally (onRegisterSubmit
  // supplied), even if createVaultSetupTokenUrl/approveVaultSetupTokenUrl were mistakenly passed
  // in for it — that flow, if Checkout needs it, would go through a separate stored-payment-
  // methods component/builder instead.
  const vaultOnly = paymentVaultOnly && !onRegisterSubmit;

  // undefined = nothing chosen yet, "new" = "add a new card" selected, otherwise a vaulted
  // payment token id — one radio group, so one piece of state instead of two kept in sync by hand.
  const [selectedCard, setSelectedCard] = useState<string>();
  const addNew = selectedCard === "new";
  const vaultId = selectedCard && !addNew ? selectedCard : undefined;

  const [paying, setPaying] = useState(false);
  const save = useRef<HTMLInputElement>(null);
  // Set by submit() when an external caller (e.g. commercetools Checkout) passes
  // storePaymentDetails=true — combined with the local "save this card" checkbox.
  const externalStoreInVaultRef = useRef(false);

  const [cardFieldsState, setCardFieldsState] = useState<CardFieldsState>({
    form: null,
    fields: {},
  });
  const { form: cardFieldsForm, fields: cardFields } = cardFieldsState;

  const threeDSAuth = settings?.threeDSOption;

  const cardPaymentTokens = useMemo(
    () =>
      paymentTokens?.payment_tokens?.filter(
        (paymentToken) => paymentToken.payment_source.card !== undefined
      ),
    [paymentTokens]
  );

  const hostedFieldClasses = useMemo(() => {
    const hostedFieldsPayButtonClasses =
      settings?.hostedFieldsPayButtonClasses || CARD_FIELDS_PAY_BUTTON;
    const hostedFieldsInputFieldClasses =
      settings?.hostedFieldsInputFieldClasses || CARD_FIELDS_INPUTS;
    return { hostedFieldsPayButtonClasses, hostedFieldsInputFieldClasses };
  }, [settings]);

  const shouldStoreInVault = () =>
    save.current?.checked || externalStoreInVaultRef.current;

  const approveTransaction = (
    approveData: CustomOnApproveData | ApproveVaultSetupTokenData
  ) => {
    if (vaultOnly) {
      handleApproveVaultSetupToken(
        approveData as ApproveVaultSetupTokenData
      ).catch((err) => {
        setPaying(false);
        errorFunc(err, isLoading, notify, t);
      });
    } else {
      handleOnApprove(approveData as CustomOnApproveData).catch((err) => {
        setPaying(false);
        errorFunc(err, isLoading, notify, t);
      });
    }
  };

  useEffect(() => {
    const orderPayerAction = orderDataLinks?.filter(
      (orderDataLink) => orderDataLink.rel === "payer-action"
    );

    if (orderPayerAction && orderPayerAction[0]) {
      window.location.href = orderPayerAction[0].href;
    }
  }, [orderDataLinks, orderId]);

  useEffect(() => {
    // cardFieldsForm only ever transitions null -> ready once, so this can't double-notify
    // without needing a separate "already notified" flag.
    if (cardFieldsForm && !cardFieldsForm.isEligible()) {
      notify("Error", t("cardFields.notEligible"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardFieldsForm]);

  const handleApprove = (data: CardFieldsOnApproveData) => {
    if (vaultOnly) {
      approveTransaction({ vaultSetupToken: data.orderID });
      return;
    }

    const approveData: CustomOnApproveData = {
      orderID: data.orderID,
      saveCard: shouldStoreInVault(),
    };

    if (threeDSAuth) {
      handleAuthenticateThreeDSOrder(data.orderID).then((result) => {
        switch (result.toString(10)) {
          case "2":
            approveTransaction(approveData);
            break;
          case "1":
            notify("Warning", t("cardFields.tryAgain"));
            isLoading(false);
            setPaying(false);
            break;
          case "0":
          default:
            notify("Error", t("cardFields.selectDifferentMethod"));
            isLoading(false);
            setPaying(false);
            break;
        }
      });
    } else {
      approveTransaction(approveData);
    }
  };

  const handleError = (error: Record<string, unknown>) => {
    setPaying(false);
    errorFunc(error, isLoading, notify, t);
  };

  const submit = async (storePaymentDetails?: boolean): Promise<void> => {
    externalStoreInVaultRef.current = storePaymentDetails ?? false;
    setPaying(true);
    isLoading(true);
    try {
      // Silently does nothing if cardFieldsForm isn't ready yet (mirrors the same gap in
      // PayPalComponent.submit() in PayPalBuilder.ts, which no-ops the same way when no handler
      // has been registered) — a caller relying on submit()'s promise to mean "something happened"
      // can be fooled by this; not fixed here since it's a shared, builder-level limitation.
      await cardFieldsForm?.submit();
    } catch (err) {
      handleError(err as Record<string, unknown>);
    }
  };

  useEffect(() => {
    if (!cardFieldsForm) return;

    onRegisterSubmit?.((storePaymentDetails) => submit(storePaymentDetails));
    onRegisterValidation?.({
      isValid: async () => (await cardFieldsForm.getState()).isFormValid,
      showValidation: async () => {
        const state = await cardFieldsForm.getState();
        applyFieldValidationClasses(state, cardFields);
      },
    });
    // Registers once per fresh cardFieldsForm instance. onRegisterSubmit/onRegisterValidation are
    // included since they're stable setter closures created once in PayPalBuilder.ts's mount() —
    // adding them can't cause extra re-registrations. submit/cardFields are deliberately excluded:
    // both are re-derived every render from the same cardFieldsForm this effect already re-runs
    // for, so including them would only cause redundant re-registration, not fresher values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardFieldsForm, onRegisterSubmit, onRegisterValidation]);

  const cardFieldsChildren = (
    <div id="checkout-form">
      <CardFieldsFormSync onChange={setCardFieldsState} />
      <PayPalNameField
        className={hostedFieldClasses.hostedFieldsInputFieldClasses}
      />
      <PayPalNumberField
        className={hostedFieldClasses.hostedFieldsInputFieldClasses}
      />
      <PayPalExpiryField
        className={hostedFieldClasses.hostedFieldsInputFieldClasses}
      />
      <PayPalCVVField
        className={hostedFieldClasses.hostedFieldsInputFieldClasses}
      />

      {enableVaulting && !vaultOnly && (
        <label className="p-1.5">
          <input
            type="checkbox"
            id="save"
            name="save"
            ref={save}
            className="mr-1"
          />
          {t("cardFields.saveForFuture")}
        </label>
      )}
      {!onRegisterSubmit && (
        <div className="py-2 px-1.5">
          <button
            className={hostedFieldClasses.hostedFieldsPayButtonClasses}
            onClick={() => submit()}
            disabled={paying}
          >
            {vaultOnly ? t("cardFields.save") : t("cardFields.pay")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* In Checkout mode (onRegisterSubmit supplied), saved cards are handled by a separate
          stored-payment-methods component instead — this component only ever collects a new card. */}
      {!vaultOnly && !onRegisterSubmit && (
        <>
          <table cellPadding={5} className="max-w-fit">
            <tbody>
              {cardPaymentTokens?.map((paymentToken) => {
                const { id, payment_source } = paymentToken;
                return (
                  <tr key={id}>
                    <td>
                      <input
                        type="radio"
                        name="card"
                        value={id}
                        onChange={(e) => setSelectedCard(e.target.value)}
                      />
                    </td>
                    <Card {...payment_source.card} />
                  </tr>
                );
              })}
              <tr>
                <td>
                  <input
                    type="radio"
                    name="card"
                    id="addNewCard"
                    onChange={() => setSelectedCard("new")}
                  />
                </td>
                <td colSpan={4}>
                  <label htmlFor="addNewCard">
                    {t("cardFields.addNewCard")}
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          {vaultId && (
            <button
              className={hostedFieldClasses.hostedFieldsPayButtonClasses}
              onClick={() =>
                handleCreateOrder({
                  paymentSource: "card",
                  storeInVault: false,
                  vaultId: vaultId,
                })
              }
            >
              {t("cardFields.pay")}
            </button>
          )}
        </>
      )}
      {(addNew || vaultOnly || !!onRegisterSubmit) &&
        (vaultOnly ? (
          <PayPalCardFieldsProvider
            createVaultSetupToken={() => handleCreateVaultSetupToken("card")}
            onApprove={handleApprove}
            onError={handleError}
          >
            {cardFieldsChildren}
          </PayPalCardFieldsProvider>
        ) : (
          <PayPalCardFieldsProvider
            createOrder={() =>
              handleCreateOrder({
                paymentSource: "card",
                storeInVault: shouldStoreInVault(),
                verificationMethod: threeDSAuth || undefined,
              })
            }
            onApprove={handleApprove}
            onError={handleError}
          >
            {cardFieldsChildren}
          </PayPalCardFieldsProvider>
        ))}
    </>
  );
};
