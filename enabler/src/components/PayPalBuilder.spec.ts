let capturedElement: any;
const mockRender = jest.fn((element: any) => {
  capturedElement = element;
});
const mockRoot = { render: mockRender };

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => mockRoot),
}));

import { PayPalComponentBuilder } from "./PayPalBuilder";

describe("PayPalComponentBuilder", () => {
  beforeEach(() => {
    capturedElement = undefined;
    mockRender.mockClear();
    document.body.innerHTML = '<div id="paypal-container"></div>';
  });

  it("standard builder: no default fundingSource — lets <PayPalButtons/> auto-render every eligible funding source", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      { sdkOptions: {}, settings: undefined } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(
      capturedElement.props.customOptions.fundingSource
    ).toBeUndefined();
  });

  it("standard builder: enableFunding paylater + disableFunding sepa are always set on scriptOptions", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      { sdkOptions: {}, settings: undefined } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.options).toMatchObject({
      enableFunding: "paylater",
      disableFunding: "sepa",
    });
  });

  it("standard builder: settings.PayPal.fundingSource overrides the (absent) default", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      {
        sdkOptions: {},
        settings: { PayPal: { fundingSource: "paylater" } },
      } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.fundingSource).toEqual(
      "paylater"
    );
  });

  it("express builder: defaults to fundingSource 'paypal' when unconfigured", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      { sdkOptions: {}, settings: undefined } as any,
      "express"
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.fundingSource).toEqual(
      "paypal"
    );
  });

  it("express builder: settings.PayPalExpress.fundingSource overrides the default", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      {
        sdkOptions: {},
        settings: { PayPalExpress: { fundingSource: "venmo" } },
      } as any,
      "express"
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.fundingSource).toEqual(
      "venmo"
    );
  });

  it("express builder: buttonLabel is always 'buynow', even when processor config sets a different style", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      {
        sdkOptions: {},
        settings: {
          PayPalExpress: {
            style: { buttonColor: "gold", buttonShape: "pill" },
          },
        },
      } as any,
      "express"
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(
      capturedElement.props.customOptions.initialSettings.paypalButtonConfig
        .buttonLabel
    ).toBe("buynow");
    // the rest of the overridden style still applies — only buttonLabel is hardcoded
    expect(
      capturedElement.props.customOptions.initialSettings.paypalButtonConfig
        .buttonColor
    ).toBe("gold");
  });

  it("standard builder: buttonLabel is not forced — settings.PayPal.style.buttonLabel is honored as-is", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      {
        sdkOptions: {},
        settings: {
          PayPal: {
            style: { buttonColor: "gold", buttonLabel: "checkout" },
          },
        },
      } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(
      capturedElement.props.customOptions.initialSettings.paypalButtonConfig
        .buttonLabel
    ).toBe("checkout");
  });

  it("does not set fundingSource for CardFields, which never renders a PayPalButtons instance", async () => {
    const builder = new PayPalComponentBuilder(
      "CardFields",
      { sdkOptions: {}, settings: undefined } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.fundingSource).toBeUndefined();
  });

  it("standard builder: vaulting is forced off for non-CardFields payment methods, even when the merchant enables it", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      {
        sdkOptions: {},
        settings: { storeInVaultOnSuccess: true },
        enableVaulting: true,
      } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.enableVaulting).toBe(false);
    expect(
      capturedElement.props.customOptions.initialSettings.storeInVaultOnSuccess
    ).toBe(false);
  });

  it("CardFields builder: vaulting respects merchant config instead of being forced off", async () => {
    const builder = new PayPalComponentBuilder(
      "CardFields",
      {
        sdkOptions: {},
        settings: { storeInVaultOnSuccess: true },
        enableVaulting: true,
      } as any,
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.customOptions.enableVaulting).toBe(true);
    expect(
      capturedElement.props.customOptions.initialSettings.storeInVaultOnSuccess
    ).toBe(true);
  });
});
