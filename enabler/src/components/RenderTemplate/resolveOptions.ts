import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  ApplePayResolvedOptions,
  BuilderType,
  CardFieldsResolvedOptions,
  CardFieldsStoredResolvedOptions,
  GooglePayResolvedOptions,
  PayPalBrandButtonType,
  PayPalBrandResolvedOptions,
  PayUponInvoiceResolvedOptions,
} from "../../types";
import {
  buildScriptOptions,
  ENABLER_DEFAULT_CONFIG,
  ENABLER_DEFAULT_EXPRESS_CONFIG,
  FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE,
  PAY_UPON_INVOICE_FRAUDNET_PAGE_ID,
  PAY_UPON_INVOICE_MAX_PAYABLE_AMOUNT,
  PAY_UPON_INVOICE_MIN_PAYABLE_AMOUNT,
} from "../constants";

// 4-layer resolution (category 2, lowest → highest priority), per mounted payment method:
// 1) ENABLER_DEFAULT_EXPRESS_CONFIG/ENABLER_DEFAULT_CONFIG (built-in safety net),
// 2) "general settings" — the shared style, independent of paymentMethodType/builderType, that
// the processor resolved from the CT custom object/PAYPAL_SETTINGS
// (settings.paypalButtonConfig/buttonShape; PayPal only — CardFields has no equivalent),
// 3) this payment method's processor override (settings.PayPal/PayPalExpress/CardFields, from
// PAYPAL_BUTTON_CONFIG), 4) FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE (category 1,
// below). Each layer is a shallow, whole-object replace — "style"/"fundingSources"/
// "components" are independent of each other, but neither is merged field-by-field with what
// a lower layer produced (see enabler/README.md for the worked example).
export function resolvePayPalBrandOptions(
  paymentMethodType: PayPalBrandButtonType,
  baseOptions: BaseOptions,
  builderType?: BuilderType
): PayPalBrandResolvedOptions {
  // Only PayPal's own component with builderType: "express" ever sets this — see
  // createExpressBuilder in payment-enabler-paypal.ts. Checked first/unconditionally (not
  // per-payment-method) since no other paymentMethodType can ever produce it.
  const isExpress = builderType === "express";

  const resolvedDefaults = isExpress
    ? ENABLER_DEFAULT_EXPRESS_CONFIG
    : ENABLER_DEFAULT_CONFIG[paymentMethodType];

  // Standard (non-express) components all share the ONE script config resolved once in
  // PayPalPaymentEnabler._Setup() (see BaseOptions.paypalScriptOptions) — avoids each mounted
  // component's own PayPalScriptProvider racing on the PayPal JS SDK.
  // Express is supposed to be loaded on a different page so it keeps resolving own config.
  const options = isExpress
    ? buildScriptOptions(
        baseOptions,
        {
          // ENABLER_DEFAULT_EXPRESS_CONFIG.components's own fallback, lowest priority
          components: resolvedDefaults.components,
          ...baseOptions.expressSdkOptions,
        },
        true
      )
    : baseOptions.paypalScriptOptions;
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE[paymentMethodType];
  // PayPal Express keeps its existing overridable fundingSource (settings.PayPalExpress.fundingSource)
  const resolvedFixedConfig = isExpress
    ? undefined
    : fixedOverrides?.[paymentMethodType];
  const generalStyle =
    baseOptions.settings.paypalButtonConfig && baseOptions.settings.buttonShape
      ? {
          buttonColor: baseOptions.settings.paypalButtonConfig.buttonColor,
          buttonLabel: baseOptions.settings.paypalButtonConfig.buttonLabel,
          buttonShape: baseOptions.settings.buttonShape,
        }
      : undefined;
  // Same "general settings" tier as generalStyle above, but for the <PayPalMessages/> widget —
  // sourced from the CT custom object's legacy payLater* fields. Layout is fixed to "text" here;
  // payLaterMessagingType (per-page "flex" vs "text" selection) isn't wired yet — please open an
  // issue if you need "flex" layout support.
  const generalMessagesStyle = {
    layout: "text",
    logo: {
      type: baseOptions.settings.payLaterMessageTextLogoType,
      position: baseOptions.settings.payLaterMessageTextLogoPosition,
    },
    text: {
      color: baseOptions.settings.payLaterMessageTextColor,
      size: Number(baseOptions.settings.payLaterMessageTextSize),
      align: baseOptions.settings.payLaterMessageTextAlign,
    },
    color: baseOptions.settings.payLaterMessageFlexColor,
    ratio: baseOptions.settings.payLaterMessageFlexRatio,
  } as PayPalBrandResolvedOptions["messagesStyle"];
  const resolvedOverride = isExpress
    ? baseOptions.settings.PayPalExpress
    : baseOptions.settings[paymentMethodType];

  const resolvedStyle =
    resolvedOverride?.style ?? generalStyle ?? resolvedDefaults?.style;
  // resolvedFixedConfig wins outright when present (Sepa/PayLater/PayPalCreditCard/Venmo) — see
  // FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE's comment; AllButtons has no entry there, so
  // it falls through to the normal, overridable chain and stays undefined by default.
  const fundingSource =
    resolvedFixedConfig?.fundingSource ??
    resolvedOverride?.fundingSource ??
    resolvedDefaults?.fundingSource;
  const messagesStyle =
    resolvedFixedConfig?.messagesStyle ??
    resolvedOverride?.messagesStyle ??
    generalMessagesStyle;
  const disablePayLaterButton =
    resolvedFixedConfig?.disablePayLaterButton ??
    resolvedOverride?.disablePayLaterButton;

  const initialSettings = {
    ...baseOptions.settings,
    ...(resolvedStyle && {
      paypalButtonConfig: {
        buttonColor: resolvedStyle.buttonColor,
        // Category 1 — hardcoded, non-overridable for builderType: "express" specifically:
        // PayPal Express is the Buy-Now/one-click flow, so its label must always read "buynow"
        // regardless of merchant config. Can't live in
        // FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE (keyed by paymentMethodType, which is
        // "PayPal" for both standard and express) or in ENABLER_DEFAULT_EXPRESS_CONFIG alone
        // (resolvedOverride's style, if set at all, would otherwise replace it wholesale — see
        // the 4-layer resolution comment above).
        buttonLabel: isExpress ? "buynow" : resolvedStyle.buttonLabel,
      },
      buttonShape: resolvedStyle.buttonShape,
    }),
    ...fixedOverrides,
    // Vaulting is only genuinely supported end-to-end for CardFields today — commercetools
    // Checkout's own stored-payment-methods feature only ever surfaces card tokens back (see
    // storedPaymentMethod.utils.ts), so vaulting via any PayPal-brand button is a dead end right
    // now regardless of merchant config. If a merchant needs vaulting for another payment method,
    // please open an issue.
    storeInVaultOnSuccess: false,
  };

  return {
    options,
    initialSettings,
    enableVaulting: false,
    ...(fundingSource && { fundingSource }),
    ...(messagesStyle && { messagesStyle }),
    disablePayLaterButton,
  };
}

export function resolveCardFieldsOptions(
  baseOptions: BaseOptions
): CardFieldsResolvedOptions {
  // CardFields has no button style/fundingSource of its own (nothing in CardFields.tsx's render
  // tree ever reads initialSettings.paypalButtonConfig/buttonShape or a fundingSource prop).
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE.CardFields;

  return {
    options: baseOptions.paypalScriptOptions,
    initialSettings: { ...baseOptions.settings, ...fixedOverrides },
    enableVaulting: baseOptions.enableVaulting ?? false,
  };
}

export function resolveCardFieldsStoredOptions(
  baseOptions: BaseOptions
): CardFieldsStoredResolvedOptions {
  // Unlike every other resolver, no buildScriptOptions()/PAYPAL_SDK_OPTIONS lookup here at all —
  // charging an already-vaulted card never touches the PayPal JS SDK client-side (see
  // useSettings.tsx's isStoredCheckoutComponent), so there's no script to configure.
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE.CardFieldsStored;

  return {
    initialSettings: { ...baseOptions.settings, ...fixedOverrides },
    enableVaulting: baseOptions.enableVaulting ?? false,
  };
}

export function resolveApplePayOptions(
  baseOptions: BaseOptions
): ApplePayResolvedOptions {
  // ApplePay has no button style/fundingSource concept.
  // Only applePayDisplayName goes through its own settings chain.

  // Missing-config warning for this lives in the processor's config()
  const applePayDisplayName =
    baseOptions.settings.ApplePay?.applePayDisplayName ??
    ENABLER_DEFAULT_CONFIG.ApplePay.applePayDisplayName ??
    "";

  // Vaulting is off unconditionally in Checkout mode for Apple Pay — not merchant-configurable
  // here. The legacy self-hosted vaulted-card UI in ApplePayMask.tsx is naturally never reached
  // under Checkout regardless (see its own comment), so no gate is needed on this side either.
  return {
    options: baseOptions.paypalScriptOptions,
    initialSettings: baseOptions.settings,
    enableVaulting: false,
    applePayDisplayName,
  };
}

export function resolveGooglePayOptions(
  baseOptions: BaseOptions
): GooglePayResolvedOptions {
  // GooglePay has no button style/fundingSource concept either. Its own API config
  // (allowedCardNetworks/allowedCardAuthMethods/callbackIntents/button appearance) follows the
  // same merchant-override chain as applePayDisplayName above.
  const override = baseOptions.settings.GooglePay;
  const defaults = ENABLER_DEFAULT_CONFIG.GooglePay;

  // verificationMethod is the shared threeDSOption merchant setting — same source
  // CardFieldsMask.tsx already reads directly, not a GooglePay-only override. Falls back to
  // defaults.verificationMethod when unset, matching every other field resolved below — previously
  // this skipped the fallback entirely and silently sent GooglePay `verificationMethod: undefined`
  // whenever threeDSOption wasn't configured.
  const verificationMethod =
    baseOptions.settings.threeDSOption || defaults?.verificationMethod;

  // environment is derived from the processor's own sandbox/live config — not merchant
  // configurable per component, unlike everything else resolved here.
  const environment: "TEST" | "PRODUCTION" =
    baseOptions.environment?.toLowerCase() === "sandbox"
      ? "TEST"
      : "PRODUCTION";

  return {
    options: baseOptions.paypalScriptOptions,
    initialSettings: baseOptions.settings,
    enableVaulting: false,
    environment,
    verificationMethod,
    allowedCardNetworks:
      override?.allowedCardNetworks ?? defaults?.allowedCardNetworks ?? [],
    allowedCardAuthMethods:
      override?.allowedCardAuthMethods ??
      defaults?.allowedCardAuthMethods ??
      [],
    callbackIntents:
      override?.callbackIntents ?? defaults?.callbackIntents ?? [],
    buttonColor: override?.buttonColor ?? defaults?.buttonColor,
    buttonType: override?.buttonType ?? defaults?.buttonType,
    buttonRadius: override?.buttonRadius ?? defaults?.buttonRadius,
    buttonSizeMode: override?.buttonSizeMode ?? defaults?.buttonSizeMode,
    apiVersion: override?.apiVersion ?? defaults?.apiVersion,
    apiVersionMinor: override?.apiVersionMinor ?? defaults?.apiVersionMinor,
    totalPriceStatus: override?.totalPriceStatus ?? defaults?.totalPriceStatus,
  };
}

export function resolvePayUponInvoiceOptions(
  baseOptions: BaseOptions
): PayUponInvoiceResolvedOptions {
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE.PayUponInvoice;
  const settings = baseOptions.settings.PayUponInvoice;

  return {
    options: baseOptions.paypalScriptOptions,
    initialSettings: { ...baseOptions.settings, ...fixedOverrides },
    enableVaulting: false,
    merchantId: settings?.merchantId ?? "",
    // Category 1 — hardcoded, non-overridable: see PAY_UPON_INVOICE_FRAUDNET_PAGE_ID/_MIN/
    // _MAX_PAYABLE_AMOUNT's own comment in constants.ts.
    pageId: PAY_UPON_INVOICE_FRAUDNET_PAGE_ID,
    minPayableAmount: PAY_UPON_INVOICE_MIN_PAYABLE_AMOUNT,
    maxPayableAmount: PAY_UPON_INVOICE_MAX_PAYABLE_AMOUNT,
    invoiceBenefitsMessage:
      settings?.invoiceBenefitsMessage ??
      ENABLER_DEFAULT_CONFIG.PayUponInvoice.invoiceBenefitsMessage,
  };
}
