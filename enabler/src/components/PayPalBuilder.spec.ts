let capturedElement: any;
const mockRender = jest.fn((element: any) => {
  capturedElement = element;
});
const mockRoot = { render: mockRender };

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => mockRoot),
}));

import { PayPalComponentBuilder } from "./PayPalBuilder";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";

const baseOptions = (overrides: Partial<BaseOptions> = {}): BaseOptions =>
  ({
    processorUrl: "https://processor.example",
    sessionId: "session-id",
    sdkOptions: {},
    settings: {},
    ...overrides,
  } as BaseOptions);

describe("PayPalComponentBuilder", () => {
  beforeEach(() => {
    capturedElement = undefined;
    mockRender.mockClear();
    document.body.innerHTML = '<div id="paypal-container"></div>';
  });

  it("throws when the selector doesn't match an element", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});

    await expect(component.mount("#missing")).rejects.toThrow(
      "Element not found for selector: #missing"
    );
  });

  it("renders a RenderTemplate element exactly once", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(capturedElement.type).toBe(RenderTemplate);
  });

  it("forwards paymentMethodType, builderType and baseOptions unchanged", async () => {
    const options = baseOptions({
      processorUrl: "https://my-processor.example",
    });
    const builder = new PayPalComponentBuilder("Sepa", options, "express");
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.paymentMethodType).toBe("Sepa");
    expect(capturedElement.props.builderType).toBe("express");
    // processorUrl is no longer a separate prop here — RenderTemplate derives it from
    // baseOptions.processorUrl itself, so asserting baseOptions is unchanged covers it.
    expect(capturedElement.props.baseOptions).toBe(options);
  });

  it("genericOptions.requestHeader carries the session id via sessionHeader()", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions({ sessionId: "abc-123" }),
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.genericOptions.requestHeader).toEqual({
      "Content-Type": "application/json",
      "X-Session-Id": "abc-123",
    });
  });

  it("genericOptions.showPayButton defaults to true when config doesn't set it", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    expect(capturedElement.props.genericOptions.showPayButton).toBe(true);
  });

  it("genericOptions.showPayButton honors an explicit false from config", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({ showPayButton: false });
    await component.mount("#paypal-container");

    expect(capturedElement.props.genericOptions.showPayButton).toBe(false);
  });

  it("genericOptions.fullWidth/buttonText/onError/initialAmount pass through from config unchanged", async () => {
    const onError = jest.fn();
    const initialAmount = {
      centAmount: 1000,
      currencyCode: "EUR",
      fractionDigits: 2,
    };
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({
      fullWidth: true,
      buttonText: "Pay now",
      onError,
      initialAmount,
    });
    await component.mount("#paypal-container");

    expect(capturedElement.props.genericOptions.fullWidth).toBe(true);
    expect(capturedElement.props.genericOptions.buttonText).toBe("Pay now");
    expect(capturedElement.props.genericOptions.onError).toBe(onError);
    expect(capturedElement.props.genericOptions.initialAmount).toBe(
      initialAmount
    );
  });

  it("onRegisterSubmit wires component.submit() to the registered handler", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    const submitHandler = jest.fn().mockResolvedValue(undefined);
    capturedElement.props.genericOptions.onRegisterSubmit(submitHandler);

    await component.submit({ storePaymentDetails: true });

    expect(submitHandler).toHaveBeenCalledWith(true);
  });

  it("onRegisterValidation wires component.showValidation()/isValid() to the registered handlers", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});
    await component.mount("#paypal-container");

    const showValidation = jest.fn().mockResolvedValue(undefined);
    const isValid = jest.fn().mockResolvedValue(false);
    capturedElement.props.genericOptions.onRegisterValidation({
      showValidation,
      isValid,
    });

    await component.showValidation();
    expect(showValidation).toHaveBeenCalled();

    await expect(component.isValid()).resolves.toBe(false);
  });

  it("isValid() defaults to true before any validation handler is registered", async () => {
    const builder = new PayPalComponentBuilder(
      "PayPal",
      baseOptions(),
      undefined
    );
    const component = builder.build({});

    await expect(component.isValid()).resolves.toBe(true);
  });

  describe("isAvailable()", () => {
    it.each<
      [
        (
          | "Sepa"
          | "PayLater"
          | "PayPalCreditCard"
          | "Venmo"
          | "PayPal"
          | "Credit"
          | "Blik"
        ),
        string
      ]
    >([
      ["Sepa", "sepa"],
      ["PayLater", "paylater"],
      ["PayPalCreditCard", "card"],
      ["PayPal", "paypal"],
      ["Credit", "credit"],
      ["Blik", "blik"],
    ])(
      "%s is unavailable when its own funding source (%s) is in standardScriptOptions.disableFunding",
      async (paymentMethodType, fundingSource) => {
        const builder = new PayPalComponentBuilder(
          paymentMethodType,
          baseOptions({
            standardScriptOptions: { disableFunding: [fundingSource] },
          } as any),
          undefined
        );
        const component = builder.build({});

        await expect(component.isAvailable()).resolves.toBe(false);
      }
    );

    it.each<
      [
        | "Sepa"
        | "PayLater"
        | "PayPalCreditCard"
        | "Venmo"
        | "PayPal"
        | "Credit"
        | "Blik"
      ]
    >([
      ["Sepa"],
      ["PayLater"],
      ["PayPalCreditCard"],
      ["PayPal"],
      ["Credit"],
      ["Blik"],
    ])(
      "%s is available when disableFunding is unset",
      async (paymentMethodType) => {
        const builder = new PayPalComponentBuilder(
          paymentMethodType,
          baseOptions(),
          undefined
        );
        const component = builder.build({});

        await expect(component.isAvailable()).resolves.toBe(true);
      }
    );

    it("Venmo is unavailable when the browser doesn't support it (e.g. iOS Firefox), even if disableFunding doesn't exclude venmo", async () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/41.0 Mobile/15E148 Safari/605.1.15",
        configurable: true,
      });

      const builder = new PayPalComponentBuilder(
        "Venmo",
        baseOptions(),
        undefined
      );
      const component = builder.build({});

      await expect(component.isAvailable()).resolves.toBe(false);

      Object.defineProperty(navigator, "userAgent", {
        value: originalUserAgent,
        configurable: true,
      });
    });

    it("CardFields is unavailable when 'card-fields' is absent from standardScriptOptions.components", async () => {
      const builder = new PayPalComponentBuilder(
        "CardFields",
        baseOptions({
          standardScriptOptions: { components: ["buttons"] },
        } as any),
        undefined
      );
      const component = builder.build({});

      await expect(component.isAvailable()).resolves.toBe(false);
    });

    it("CardFields is available when 'card-fields' is present in standardScriptOptions.components", async () => {
      const builder = new PayPalComponentBuilder(
        "CardFields",
        baseOptions({
          standardScriptOptions: { components: ["buttons", "card-fields"] },
        } as any),
        undefined
      );
      const component = builder.build({});

      await expect(component.isAvailable()).resolves.toBe(true);
    });

    it("ApplePay is unavailable when 'applepay' is absent from standardScriptOptions.components, even when the browser itself supports Apple Pay", async () => {
      // Stub window.ApplePaySession so the browser-capability check (checked first) passes,
      // isolating the components-list check this test actually targets.
      (window as any).ApplePaySession = { canMakePayments: () => true };

      const builder = new PayPalComponentBuilder(
        "ApplePay",
        baseOptions({
          standardScriptOptions: { components: ["buttons"] },
        } as any),
        undefined
      );
      const component = builder.build({});

      await expect(component.isAvailable()).resolves.toBe(false);

      delete (window as any).ApplePaySession;
    });

    it("AllButtons is always available, regardless of disableFunding/components", async () => {
      const builder = new PayPalComponentBuilder(
        "AllButtons",
        baseOptions({
          standardScriptOptions: {
            disableFunding: ["sepa", "venmo", "paylater", "card"],
            components: [],
          },
        } as any),
        undefined
      );
      const component = builder.build({});

      await expect(component.isAvailable()).resolves.toBe(true);
    });
  });
});
