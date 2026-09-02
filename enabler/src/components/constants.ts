import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import {
  GetSettingsResponse,
  PayPalMethodConfig,
  PayPalPaymentMethodType,
} from "../types";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";

/*
IMPORTANT — if you deploy these payment components yourself, outside commercetools Checkout
(i.e. without going through the processor/enabler wiring below), it is entirely your
responsibility to provide every URL these components use, AND to implement the actual logic
behind each one (request/response shape, auth, error handling — not just the endpoint address).
None of that is supplied for you in this scenario.

The following URLs are additionally irrelevant for the commercetools Checkout flow specifically,
since that data is instead handled by the processor and/or have limited support in the checkout:
getSettingsUrl, createVaultSetupTokenUrl, approveVaultSetupTokenUrl
 */

const stripTrailingSlash = (processorUrl: string) => processorUrl.replace(/\/$/, "");

export const processorUrls = (processorUrl: string) => {
  const base = stripTrailingSlash(processorUrl);
  return {
    createPaymentUrl: `${base}/payments`,
    onApproveUrl: `${base}/payments/approve`,
    createOrderUrl: `${base}/payments/createOrder`,
    authorizeOrderUrl: `${base}/payments/authorize`,
    expressApproveUrl: `${base}/payments/expressApprove`,
    authenticateThreeDSOrderUrl: `${base}/payments/3ds`,
    updateShippingUrl: `${base}/payments/updateShipping`,
    getStoredPaymentMethodsURL: `${base}/stored-payment-methods`,
  };
};

// The one route needing a path param — processorUrls()'s flat string map can't express that.
export const storedPaymentMethodUrl = (processorUrl: string, id: string) =>
  `${stripTrailingSlash(processorUrl)}/stored-payment-methods/${id}`;

// RenderTemplate/resolveOptions.ts's resolution config — see that file's 4-layer resolution
// comment for how these fit together.

// Category 1 — hardcoded, non-overridable: something the merchant/processor should not be able to configure —
// e.g. Pay Upon Invoice must always use Capture intent. Applied last, unconditionally, per mounted component
// — whatever the  processor sends can never change these.
export const FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE: Partial<
  Record<PayPalPaymentMethodType, Partial<GetSettingsResponse>>
> = {
  // PayUponInvoice: { payPalIntent: "Capture" },
  // Sepa/PayLater/PayPalCreditCard/Venmo are funding-source-only payment methods built on the
  // standard PayPal smart button — their funding source is a method identity, not a merchant
  // preference, so it's fixed here rather than left to PAYPAL_BUTTON_CONFIG. AllButtons
  // deliberately has no entry: it stays undefined by default (renders every eligible funding
  // source) and remains overridable via the normal ENABLER_DEFAULT_CONFIG/settings chain below.
  Sepa: { Sepa: { fundingSource: "sepa" } },
  PayLater: { PayLater: { fundingSource: "paylater" } },
  PayPalCreditCard: { PayPalCreditCard: { fundingSource: "card" } },
  Venmo: { Venmo: { fundingSource: "venmo" } },
};

// The one true special case — only PayPal's own component with builderType: "express" needs
// config distinct from its own paymentMethodType entry (see ENABLER_DEFAULT_CONFIG below and
// mount()'s express-first resolution). Not folded into the generic per-payment-method config map
// below, since no other payment method is ever expected to need a second config slot like this.
export const ENABLER_DEFAULT_EXPRESS_CONFIG: Required<PayPalMethodConfig> = {
  // buttonLabel here is only the pre-override default — it's forced back to "buynow"
  // unconditionally in mount() below regardless of what resolvedOverride/generalStyle supply, so
  // this value never actually changes in practice; kept for a type-required field's sake.
  style: { buttonColor: "blue", buttonLabel: "buynow", buttonShape: "rect" },
  fundingSource: "paypal",
  components: "buttons,card-fields",
};
// Enabler's own built-in default, lowest-priority tier: what renders when the processor sends
// nothing at all for this payment method. Flat, keyed by paymentMethodType — add a row here for a
// future payment method needing only `components` (CardFields has no button style/funding
// sources of its own — only `components` applies to it).
export const ENABLER_DEFAULT_CONFIG: Partial<
  Record<PayPalPaymentMethodType, PayPalMethodConfig>
> = {
  // No fundingSource default — a single FUNDING_SOURCE value renders exactly one standalone
  // button (see @paypal/paypal-js's PayPalButtonFundingSource); omitting it lets <PayPalButtons/>
  // auto-render every currently-eligible funding source instead (PayPal + Pay Later via
  // enableFunding: "paylater" below; SEPA excluded via disableFunding below
  //TODO - clarify if Sepa should be included by default
  PayPal: {
    style: { buttonColor: "blue", buttonLabel: "paypal", buttonShape: "rect" },
    components: "buttons,card-fields",
  },
  CardFields: {
    components: "buttons,card-fields",
  },
  Sepa: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
    components: "buttons",
  },
  PayLater: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
    components: "buttons",
  },
  PayPalCreditCard: {
    style: { buttonColor: "black", buttonLabel: "pay", buttonShape: "rect" },
    components: "buttons",
  },
  // No fundingSource here — see FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE's comment on
  // AllButtons.
  AllButtons: {
    components: "buttons",
  },
};

// RenderTemplate/resolveOptions.ts's scriptOptions — plain defaults applied to every payment method.
export const DEFAULT_SCRIPT_CURRENCY = "EUR";
export const DEFAULT_SCRIPT_ENABLE_FUNDING: ReactPayPalScriptOptions["enableFunding"] =
  "paylater";

// Per-payment-method PayPal JS SDK script-option defaults (category 2 — overridable by
// PAYPAL_SDK_OPTIONS/componentSdkOptions, same as ENABLER_DEFAULT_CONFIG above). Only the
// standard multi-source PayPal button needs an entry: every other payment method already renders
// exactly one funding source (its fixed fundingSource from
// FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE above), so <PayPalButtons/> naturally excludes
// every other source — including sepa — without any disableFunding here. AllButtons deliberately
// has no entry either: "all" must include sepa.
export const DEFAULT_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE: Partial<
  Record<PayPalPaymentMethodType, Partial<ReactPayPalScriptOptions>>
> = {
  PayPal: {
    // TODO: placeholder default, not a final decision — see the "SEPA" entry in TODO.md. Without
    // an explicit fundingSource, <PayPalButtons/> auto-renders every eligible funding source,
    // which for some merchant accounts includes SEPA; excluded here so the default PayPal button
    // doesn't unexpectedly grow a SEPA button until it's decided whether SEPA should be offered
    // as its own separate named button instead. Override via PAYPAL_SDK_OPTIONS if needed sooner.
    disableFunding: "sepa",
  },
};

// Per-payment-method PayPal JS SDK script-option overrides (category 1 — hardcoded,
// non-overridable, same as FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE above — applied after
// componentSdkOptions so they always win).
export const FIXED_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE: Partial<
  Record<PayPalPaymentMethodType, Partial<ReactPayPalScriptOptions>>
> = {
  // Venmo funding is US-buyer-only, and the PayPal JS SDK needs buyer-country=US to render/allow
  // it at all (this parameter only affects sandbox testing — PayPal ignores it in production),
  // regardless of merchant PAYPAL_SDK_OPTIONS or the actual cart's country.
  Venmo: { buyerCountry: "US" },
};

// Shared by RenderTemplate/resolveOptions.ts's PayPal-brand and CardFields resolvers — merges the
// plain defaults, the three lookup tables above, and the processor-configured componentSdkOptions
// slice for this specific payment method (see BaseOptions.sdkOptions and PAYPAL_SDK_OPTIONS in
// processor/.env.template) into the PayPal JS SDK script options.
export function buildScriptOptions(
  paymentMethodType: PayPalPaymentMethodType,
  baseOptions: BaseOptions,
  componentSdkOptions: Record<string, unknown> | undefined,
  resolvedComponents: string | undefined
): ReactPayPalScriptOptions {
  return {
    clientId: baseOptions.clientId || "",
    currency: DEFAULT_SCRIPT_CURRENCY,
    components: resolvedComponents,
    enableFunding: DEFAULT_SCRIPT_ENABLE_FUNDING,
    ...DEFAULT_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE[paymentMethodType],
    ...componentSdkOptions,
    ...FIXED_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE[paymentMethodType],
  };
}
