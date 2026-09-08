import {
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  CUSTOM_OBJECT_DEFAULT_VALUES,
  PayPalSettings,
  resolveTypeKey,
} from "common-connect";

// PayPal JS SDK script-level options (currency, components, enableFunding/disableFunding,
// buyerCountry, locale, vault, etc.) — previously supplied directly by the merchant's own frontend
// code when mounting <PayPal/>/<CreditCard/> outside commercetools Checkout, not something the
// paypal-commercetools-connector/settings custom object manages. Configurable per componentType
// (PayPal, CardFields), plus a dedicated PayPalExpress slot for PayPal's own express builder
// variant — the one componentType with more than one builder variant (see
// PayPalComponentBuilder/createExpressBuilder in the enabler). Format: JSON object matching (a
// subset of) @paypal/paypal-js's PayPalScriptOptions shape (excluding clientId, which the config()
// response supplies separately from paypalClientId below) keyed by componentType, e.g.
// {"PayPal":{"currency":"USD"},"PayPalExpress":{"currency":"USD","enableFunding":"venmo"},"CardFields":{"currency":"USD"}}
// Passed through to the enabler as-is (see sdkOptions below) — the enabler applies its own
// enableFunding: "paylater" default (PayPalBuilder.ts) so Pay Later stays enabled if nothing is
// configured; that default lives enabler-side only, not duplicated here.
const configuredSdkOptions = process.env.PAYPAL_SDK_OPTIONS
  ? JSON.parse(process.env.PAYPAL_SDK_OPTIONS)
  : {};

// Shared script options for every *standard* component (see PAYPAL_STANDARD_SCRIPT_OPTIONS
// comment in .env.template) — layered over this connector's own built-in default the same way
// PAYPAL_SETTINGS layers over CUSTOM_OBJECT_DEFAULT_VALUES below, so an unset/{} env value keeps
// the default rather than wiping it out. `components` is narrowed further per request in
// PayPalPaymentService.config() by settings.acceptCredit.
const configuredStandardScriptOptions: {
  components: string[];
  disableFunding?: string[];
  enableFunding?: string[];
} = {
  components: ["buttons", "card-fields", "applepay"],
  ...(process.env.PAYPAL_STANDARD_SCRIPT_OPTIONS
    ? JSON.parse(process.env.PAYPAL_STANDARD_SCRIPT_OPTIONS)
    : {}),
};

// PayPal button config overrides (style/funding sources), keyed by componentType, plus a
// dedicated PayPalExpress slot (see configuredSdkOptions above) — passed through as-is; the
// enabler owns merging this over its own built-in defaults and the general settings below (see
// PAYPAL_BUTTON_CONFIG in processor/.env.template).
const configuredButtonConfig = process.env.PAYPAL_BUTTON_CONFIG
  ? JSON.parse(process.env.PAYPAL_BUTTON_CONFIG)
  : {};

const PAYMENT_INTERFACE_NAME = "PayPal";

export const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || "payment-integration",
  clientId: process.env.CTP_CLIENT_ID || "xxx",
  clientSecret: process.env.CTP_CLIENT_SECRET || "xxx",
  jwksUrl:
    process.env.CTP_JWKS_URL ||
    "https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json",
  jwtIssuer:
    process.env.CTP_JWT_ISSUER ||
    "https://mc-api.europe-west1.gcp.commercetools.com",
  authUrl:
    process.env.CTP_AUTH_URL ||
    "https://auth.europe-west1.gcp.commercetools.com",
  apiUrl:
    process.env.CTP_API_URL || "https://api.europe-west1.gcp.commercetools.com",
  sessionUrl:
    process.env.CTP_SESSION_URL ||
    "https://session.europe-west1.gcp.commercetools.com/",
  checkoutUrl:
    process.env.CTP_CHECKOUT_URL ||
    "https://checkout.europe-west1.gcp.commercetools.com",

  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000"),

  // Required by logger
  loggerLevel: process.env.LOGGER_LEVEL || "info",

  // Required for PayPal
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || "Sandbox",

  // Payment Providers config
  returnUrl: process.env.MERCHANT_RETURN_URL || "",
  // PayPal-Express-only override for the buyer redirect after authorizeOrder()/captureOrder() (see
  // buildRedirectMerchantUrl in paypal-payment.service.ts) — lets a merchant send the buyer to a
  // different page for that one flow. Falls back to the generic MERCHANT_RETURN_URL/session return
  // url when unset.
  onApprovePrefix: process.env.PAYPAL_ONAPPROVE_PREFIX || undefined,
  // Master switch for PayPal Express's pre-finalize redirect
  // (see enabler/README.md's "PayPal-Express/ legal-review requirement" section).
  redirectOnApprove: process.env.PAYPAL_REDIRECT_ON_APPROVE === "true",
  paymentInterface: PAYMENT_INTERFACE_NAME,

  // env variables related to stored payment methods feature
  storedPaymentMethodsEnabled:
    process.env.STORED_PAYMENT_METHODS_ENABLED || "false",
  storedPaymentMethodsPaymentInterface:
    process.env.STORED_PAYMENT_METHODS_PAYMENT_INTERFACE ||
    PAYMENT_INTERFACE_NAME,
  storedPaymentMethodsInterfaceAccount:
    process.env.STORED_PAYMENT_METHODS_INTERFACE_ACCOUNT || undefined,

  // General feature flags
  enableVaulting: process.env.STORED_PAYMENT_METHODS_ENABLED === "true",

  paymentTypeKey: resolveTypeKey(PAYPAL_PAYMENT_TYPE_KEY),
  customerTypeKey: resolveTypeKey(PAYPAL_CUSTOMER_TYPE_KEY),
  interactionTypeKey: resolveTypeKey(PAYPAL_PAYMENT_INTERACTION_TYPE_KEY),

  // Per-component overrides, keyed by componentType (plus the dedicated PayPalExpress slot) — see
  // PAYPAL_BUTTON_CONFIG in processor/.env.template
  buttonConfig: configuredButtonConfig,

  // Base merchant settings used whenever the paypal-commercetools-connector/settings custom object
  // isn't available (or is missing fields) — reuses the same defaults common-connect already seeds
  // a brand-new custom object with (CUSTOM_OBJECT_DEFAULT_VALUES).PAYPAL_SETTINGS layers optional
  // env-var overrides on top of that base, for local/manual testing or a merchant-specific static
  // fallback — format: JSON object matching (a subset of) common-connect's PayPalSettings shape.
  settingsFallback: {
    ...CUSTOM_OBJECT_DEFAULT_VALUES,
    ...(process.env.PAYPAL_SETTINGS
      ? JSON.parse(process.env.PAYPAL_SETTINGS)
      : {}),
  } as Partial<PayPalSettings>,

  // See the configuredSdkOptions comment above — passed through as-is, no processor-side defaulting.
  sdkOptions: configuredSdkOptions,

  // See the configuredStandardScriptOptions comment above.
  standardScriptOptions: configuredStandardScriptOptions,
};

export const getConfig = () => {
  return config;
};
