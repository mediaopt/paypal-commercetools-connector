import {
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  CUSTOM_OBJECT_DEFAULT_VALUES,
  PayPalSettings,
  resolveTypeKey,
} from "common-connect";

// PayPal Express's own PayPal JS SDK script options — kept separate from
// PAYPAL_STANDARD_SCRIPT_OPTIONS because Express mounts on its own page.
// Flat JSON object matching (a subset of) @paypal/paypal-js's PayPalScriptOptions shape
// (excluding clientId, which the config() response supplies separately from paypalClientId below),
// Passed through to the enabler as-is — no processor-side defaulting. `currency` is overridden per request from the
// cart (its total price's currencyCode) whenever available — this only takes effect as a fallback.
const configuredExpressSdkOptions: Record<string, unknown> = process.env
  .PAYPAL_EXPRESS_SDK_OPTIONS
  ? JSON.parse(process.env.PAYPAL_EXPRESS_SDK_OPTIONS)
  : {};

// Shared script options for every *standard* component (PayPal, Sepa, PayLater, PayPalCreditCard,
// AllButtons, Venmo, Credit, the active local-payment-method subset, CardFields, ApplePay,
// CardFieldsStored). An unset/{} env value keeps the default. `components` is narrowed further per request in
// PayPalPaymentService.config() by settings.acceptCredit;
// `currency`/`buyerCountry` are overlaid per request from the cart — this env value only takes effect as a
// fallback. Every standard component shares this one config.
const configuredStandardScriptOptions: {
  components: string[];
  disableFunding?: string[];
  enableFunding?: string[];
} & Record<string, unknown> = {
  components: ["buttons", "card-fields", "applepay", "googlepay", "messages"],
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

// Merchant overrides for PayPal wallet experience_context (payment_source.paypal.experience_context
// on the Orders v2 createOrder request — e.g. user_action, payment_method_preference), as a single
// flat JSON object. Spread over buildOrderRequest's own computed defaults (order.utils.ts) so any
// key set here always wins — add new experience_context fields here as needed rather than growing
// config.ts one flag at a time (see PAYPAL_ORDER_EXPERIENCE_CONTEXT in processor/.env.template).
const configuredOrderExperienceContext: Record<string, unknown> = process.env
  .PAYPAL_ORDER_EXPERIENCE_CONTEXT
  ? JSON.parse(process.env.PAYPAL_ORDER_EXPERIENCE_CONTEXT)
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

  // See configuredOrderExperienceContext comment above.
  orderExperienceContext: configuredOrderExperienceContext,

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

  expressSdkOptions: configuredExpressSdkOptions,

  // See the configuredStandardScriptOptions comment above.
  standardScriptOptions: configuredStandardScriptOptions,
};

export const getConfig = () => {
  return config;
};
