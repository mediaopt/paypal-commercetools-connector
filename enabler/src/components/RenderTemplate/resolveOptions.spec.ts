import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  resolveApplePayOptions,
  resolveCardFieldsOptions,
  resolveGooglePayOptions,
  resolvePayPalBrandOptions,
  resolvePayUponInvoiceOptions,
} from "./resolveOptions";

const baseOptions = (overrides: Partial<BaseOptions> = {}): BaseOptions =>
  ({
    settings: {},
    ...overrides,
  } as BaseOptions);

describe("resolvePayPalBrandOptions", () => {
  it("standard builder: PayPal has a fixed fundingSource 'paypal' — repurposed from the old unscoped default", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions(),
      undefined
    );
    expect(result.fundingSource).toEqual("paypal");
  });

  it("standard builder: options is the shared paypalScriptOptions object as-is — enableFunding/disableFunding merging now happens once in PayPalPaymentEnabler._Setup(), not per-method here", () => {
    const paypalScriptOptions = { clientId: "x", currency: "EUR" } as any;
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({ paypalScriptOptions }),
      undefined
    );
    // Reference identity, not just deep equality: every standard component must resolve to the
    // exact same object so its script-load hash matches every other one's — see
    // BaseOptions.paypalScriptOptions.
    expect(result.options).toBe(paypalScriptOptions);
  });

  it("standard builder: enableFunding/disableFunding, whatever _Setup() resolved onto paypalScriptOptions, pass straight through unmodified", () => {
    const paypalScriptOptions = {
      clientId: "x",
      currency: "EUR",
      enableFunding: ["venmo"],
      disableFunding: ["sepa"],
    } as any;
    const result = resolvePayPalBrandOptions(
      "AllButtons",
      baseOptions({ paypalScriptOptions }),
      undefined
    );

    expect(result.options).toMatchObject({
      enableFunding: ["venmo"],
      disableFunding: ["sepa"],
    });
  });

  it("standard builder: PayPal's fundingSource is fixed, not overridable via settings.PayPal.fundingSource", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        settings: { PayPal: { fundingSource: "paylater" } } as any,
      }),
      undefined
    );

    expect(result.fundingSource).toEqual("paypal");
  });

  it("express builder: defaults to fundingSource 'paypal' when unconfigured", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions(),
      "express"
    );

    expect(result.fundingSource).toEqual("paypal");
  });

  it("express builder: settings.PayPalExpress.fundingSource overrides the default", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        settings: { PayPalExpress: { fundingSource: "venmo" } } as any,
      }),
      "express"
    );

    expect(result.fundingSource).toEqual("venmo");
  });

  it("express builder: buttonLabel is always 'buynow', even when processor config sets a different style", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        settings: {
          PayPalExpress: {
            style: { buttonColor: "gold", buttonShape: "pill" },
          },
        } as any,
      }),
      "express"
    );

    expect(result.initialSettings.paypalButtonConfig?.buttonLabel).toBe(
      "buynow"
    );
    // the rest of the overridden style still applies — only buttonLabel is hardcoded
    expect(result.initialSettings.paypalButtonConfig?.buttonColor).toBe("gold");
  });

  it("express builder: script components default to 'buttons,messages' (ENABLER_DEFAULT_EXPRESS_CONFIG.components) when the processor sends none — PayPalMessagesWidget needs 'messages' to render at all", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({ expressSdkOptions: { currency: "USD" } as any }),
      "express"
    );

    expect(result.options).toMatchObject({ components: "buttons,messages" });
  });

  it("express builder: the processor's expressSdkOptions.components wins outright over the default, even when the merchant strips 'messages' back out", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        expressSdkOptions: { components: "buttons" } as any,
      }),
      "express"
    );

    expect(result.options).toMatchObject({ components: "buttons" });
  });

  it("standard builder: 'messages' is never forced into options.components — same shared paypalScriptOptions object as-is", () => {
    const paypalScriptOptions = {
      clientId: "x",
      currency: "EUR",
      components: ["buttons"],
    } as any;
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({ paypalScriptOptions }),
      undefined
    );

    expect(result.options).toBe(paypalScriptOptions);
  });

  it("standard builder: buttonLabel is not forced — settings.PayPal.style.buttonLabel is honored as-is", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        settings: {
          PayPal: {
            style: { buttonColor: "gold", buttonLabel: "checkout" },
          },
        } as any,
      }),
      undefined
    );

    expect(result.initialSettings.paypalButtonConfig?.buttonLabel).toBe(
      "checkout"
    );
  });

  it("vaulting is always forced off, even when the merchant enables it", () => {
    const result = resolvePayPalBrandOptions(
      "PayPal",
      baseOptions({
        settings: { storeInVaultOnSuccess: true } as any,
        enableVaulting: true,
      }),
      undefined
    );

    expect(result.enableVaulting).toBe(false);
    expect(result.initialSettings.storeInVaultOnSuccess).toBe(false);
  });
});

describe("resolveCardFieldsOptions", () => {
  it("never sets a fundingSource — CardFields never renders a PayPalButtons instance", () => {
    const result = resolveCardFieldsOptions(baseOptions());

    expect(result).not.toHaveProperty("fundingSource");
  });

  it("options is the shared paypalScriptOptions object as-is, same as resolvePayPalBrandOptions's standard branch", () => {
    const paypalScriptOptions = { clientId: "x", currency: "EUR" } as any;
    const result = resolveCardFieldsOptions(
      baseOptions({ paypalScriptOptions })
    );

    expect(result.options).toBe(paypalScriptOptions);
  });

  it("passes the merchant's general button style straight through, unlike the PayPal-brand path — CardFields has no style resolution of its own to layer on top", () => {
    const result = resolveCardFieldsOptions(
      baseOptions({
        settings: {
          paypalButtonConfig: { buttonColor: "gold", buttonLabel: "pay" },
          buttonShape: "pill",
        } as any,
      })
    );

    expect(result.initialSettings.paypalButtonConfig).toEqual({
      buttonColor: "gold",
      buttonLabel: "pay",
    });
    expect(result.initialSettings.buttonShape).toBe("pill");
  });

  it("vaulting respects merchant config instead of being forced off", () => {
    const result = resolveCardFieldsOptions(
      baseOptions({
        settings: { storeInVaultOnSuccess: true } as any,
        enableVaulting: true,
      })
    );

    expect(result.enableVaulting).toBe(true);
    expect(result.initialSettings.storeInVaultOnSuccess).toBe(true);
  });
});

describe("resolveApplePayOptions", () => {
  it("options is the shared paypalScriptOptions object as-is, same as every other standard resolver", () => {
    const paypalScriptOptions = { clientId: "x", currency: "EUR" } as any;
    const result = resolveApplePayOptions(
      baseOptions({ paypalScriptOptions })
    );

    expect(result.options).toBe(paypalScriptOptions);
  });

  it("vaulting is always forced off, unconditionally — no stored/vaulted Apple Pay support", () => {
    const result = resolveApplePayOptions(
      baseOptions({ enableVaulting: true })
    );

    expect(result.enableVaulting).toBe(false);
  });

  it("applePayDisplayName falls back to the built-in default when settings doesn't configure one", () => {
    const result = resolveApplePayOptions(baseOptions());

    expect(result.applePayDisplayName).toBe("My Store");
  });

  it("applePayDisplayName honors settings.ApplePay.applePayDisplayName when configured", () => {
    const result = resolveApplePayOptions(
      baseOptions({
        settings: {
          ApplePay: { applePayDisplayName: "Acme Store" },
        } as any,
      })
    );

    expect(result.applePayDisplayName).toBe("Acme Store");
  });
});

describe("resolveGooglePayOptions", () => {
  it.each([
    ["Sandbox", "TEST"],
    ["sandbox", "TEST"],
    ["Live", "PRODUCTION"],
    [undefined, "PRODUCTION"],
  ])("environment %s resolves to %s", (environment, expected) => {
    const result = resolveGooglePayOptions(baseOptions({ environment }));

    expect(result.environment).toBe(expected);
  });

  it("verificationMethod comes from the shared threeDSOption setting", () => {
    const result = resolveGooglePayOptions(
      baseOptions({ settings: { threeDSOption: "SCA_WHEN_REQUIRED" } as any })
    );

    expect(result.verificationMethod).toBe("SCA_WHEN_REQUIRED");
  });
});

describe("resolvePayUponInvoiceOptions", () => {
  it.each([
    ["Sandbox", true],
    ["Live", false],
    [undefined, false],
  ])("environment %s resolves fraudNetSandbox to %s", (environment, expected) => {
    const result = resolvePayUponInvoiceOptions(baseOptions({ environment }));

    expect(result.fraudNetSandbox).toBe(expected);
  });

  it("merchantId prefers settings.PayUponInvoice.merchantId", () => {
    const result = resolvePayUponInvoiceOptions(
      baseOptions({
        settings: {
          merchantId: "GENERAL",
          PayUponInvoice: { merchantId: "PUI" },
        } as any,
      })
    );

    expect(result.merchantId).toBe("PUI");
  });

  it("merchantId falls back to the top-level settings.merchantId, also when the PUI one is empty", () => {
    const result = resolvePayUponInvoiceOptions(
      baseOptions({
        settings: {
          merchantId: "GENERAL",
          PayUponInvoice: { merchantId: "" },
        } as any,
      })
    );

    expect(result.merchantId).toBe("GENERAL");
  });

  it("merchantId is an empty string when neither is configured", () => {
    const result = resolvePayUponInvoiceOptions(
      baseOptions({ settings: { merchantId: "" } as any })
    );

    expect(result.merchantId).toBe("");
  });
});
