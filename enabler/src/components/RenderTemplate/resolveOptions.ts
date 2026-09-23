import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  BuilderType,
  CardFieldsResolvedOptions,
  PayPalBrandButtonType,
  PayPalBrandResolvedOptions,
} from "../../types";
import {
  buildScriptOptions,
  ENABLER_DEFAULT_CONFIG,
  ENABLER_DEFAULT_EXPRESS_CONFIG,
  FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE,
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
  // PayPal Express keeps its existing overridable fundingSource (settings.PayPalExpress.fundingSource)
  const resolvedFixedConfig = isExpress
    ? undefined
    : FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE[paymentMethodType];
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
  return {
    options: baseOptions.paypalScriptOptions,
    initialSettings: baseOptions.settings,
    enableVaulting: baseOptions.enableVaulting ?? false,
  };
}
