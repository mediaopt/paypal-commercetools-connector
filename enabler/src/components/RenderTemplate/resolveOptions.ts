import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  ApplePayResolvedOptions,
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

  // Resolves to the processor-configured slice for this specific payment method — see
  // BaseOptions.sdkOptions and PAYPAL_SDK_OPTIONS in processor/.env.template.
  const componentSdkOptions = isExpress
    ? baseOptions.sdkOptions?.PayPalExpress
    : baseOptions.sdkOptions?.[paymentMethodType];

  const resolvedDefaults = isExpress
    ? ENABLER_DEFAULT_EXPRESS_CONFIG
    : ENABLER_DEFAULT_CONFIG[paymentMethodType];
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE[paymentMethodType];
  const resolvedFixedConfig = fixedOverrides?.[paymentMethodType];
  const generalStyle =
    baseOptions.settings.paypalButtonConfig && baseOptions.settings.buttonShape
      ? {
          buttonColor: baseOptions.settings.paypalButtonConfig.buttonColor,
          buttonLabel: baseOptions.settings.paypalButtonConfig.buttonLabel,
          buttonShape: baseOptions.settings.buttonShape,
        }
      : undefined;
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
  // Same concern as PAYPAL_SDK_OPTIONS.<paymentMethodType>.components (componentSdkOptions,
  // spread after scriptOptions.components inside buildScriptOptions) — PAYPAL_SDK_OPTIONS still
  // wins if it also sets `components`.
  const resolvedComponents =
    resolvedOverride?.components ?? resolvedDefaults?.components;

  const options = buildScriptOptions(
    paymentMethodType,
    baseOptions,
    componentSdkOptions,
    resolvedComponents
  );

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
  };
}

export function resolveCardFieldsOptions(
  baseOptions: BaseOptions
): CardFieldsResolvedOptions {
  // CardFields has no button style/fundingSource of its own (ENABLER_DEFAULT_CONFIG.CardFields
  // has neither, and nothing in CardFields.tsx's render tree ever reads
  // initialSettings.paypalButtonConfig/buttonShape or a fundingSource prop) — only `components`
  // goes through the same processor-override chain as the PayPal-brand types.
  const resolvedComponents =
    baseOptions.settings.CardFields?.components ??
    ENABLER_DEFAULT_CONFIG.CardFields?.components;
  const fixedOverrides =
    FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE.CardFields;

  const options = buildScriptOptions(
    "CardFields",
    baseOptions,
    baseOptions.sdkOptions?.CardFields,
    resolvedComponents
  );

  return {
    options,
    initialSettings: { ...baseOptions.settings, ...fixedOverrides },
    enableVaulting: baseOptions.enableVaulting ?? false,
  };
}

export function resolveApplePayOptions(
  baseOptions: BaseOptions
): ApplePayResolvedOptions {
  // ApplePay has no button style/fundingSource concept, but `components` and applePayDisplayName
  // both go through the same processor-override chain as CardFields' `components`
  const resolvedComponents =
    baseOptions.settings.ApplePay?.components ??
    ENABLER_DEFAULT_CONFIG.ApplePay.components;

  const options = buildScriptOptions(
    "ApplePay",
    baseOptions,
    baseOptions.sdkOptions?.ApplePay,
    resolvedComponents
  );

  const applePayDisplayName =
    baseOptions.settings.ApplePay?.applePayDisplayName ??
    ENABLER_DEFAULT_CONFIG.ApplePay.applePayDisplayName ??
    "";

  // Vaulting is off unconditionally in Checkout mode for Apple Pay — not merchant-configurable
  // here. The legacy self-hosted vaulted-card UI in ApplePayMask.tsx is naturally never reached
  // under Checkout regardless (see its own comment), so no gate is needed on this side either.
  return {
    options,
    initialSettings: baseOptions.settings,
    enableVaulting: false,
    applePayDisplayName,
  };
}
