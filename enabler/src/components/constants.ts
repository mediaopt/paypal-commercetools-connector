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

const stripTrailingSlash = (processorUrl: string) =>
  processorUrl.replace(/\/$/, "");

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
  // Every individual funding-source button (including PayPal itself, repurposed from the old
  // unscoped default) is built on the standard PayPal smart button — their funding source is a
  // method identity, not a merchant preference, so it's fixed here rather than left to
  // PAYPAL_BUTTON_CONFIG. AllButtons deliberately has no entry: it stays undefined by default
  // (renders every eligible funding source) and remains overridable via the normal
  // ENABLER_DEFAULT_CONFIG/settings chain below.
  PayPal: { PayPal: { fundingSource: "paypal" } },
  Sepa: { Sepa: { fundingSource: "sepa" } },
  PayLater: { PayLater: { fundingSource: "paylater" } },
  PayPalCreditCard: { PayPalCreditCard: { fundingSource: "card" } },
  Venmo: { Venmo: { fundingSource: "venmo" } },
  Credit: { Credit: { fundingSource: "credit" } },
  // Local payment methods (APMs) — active only; see (enabler/src/types/index.ts) for the not-supported-yet/obsolete groups
  Ideal: { Ideal: { fundingSource: "ideal" } },
  Bancontact: { Bancontact: { fundingSource: "bancontact" } },
  Eps: { Eps: { fundingSource: "eps" } },
  MyBank: { MyBank: { fundingSource: "mybank" } },
  P24: { P24: { fundingSource: "p24" } },
  Blik: { Blik: { fundingSource: "blik" } },
};

// The one true special case — only PayPal's own component with builderType: "express" needs
// config distinct from its own paymentMethodType entry (see ENABLER_DEFAULT_CONFIG below and
// mount()'s express-first resolution). Not folded into the generic per-payment-method config map
// below, since no other payment method is ever expected to need a second config slot like this.
// Required over only PayPal-brand's own 3 fields — not the full PayPalMethodConfig — since
// applePayDisplayName has nothing to do with PayPal Express.
export const ENABLER_DEFAULT_EXPRESS_CONFIG: Required<
  Pick<PayPalMethodConfig, "style" | "fundingSource" | "components">
> = {
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
export const ENABLER_DEFAULT_CONFIG: Record<
  PayPalPaymentMethodType,
  PayPalMethodConfig
> = {
  // fundingSource for every individual funding-source button comes from
  // FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE, not from here — this table only supplies the
  // default button style. AllButtons is the one exception: no fundingSource anywhere (renders
  // every eligible funding source the shared standardScriptOptions currently allows).
  PayPal: {
    style: { buttonColor: "blue", buttonLabel: "paypal", buttonShape: "rect" },
  },
  CardFields: {},
  Sepa: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  PayLater: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  PayPalCreditCard: {
    style: { buttonColor: "black", buttonLabel: "pay", buttonShape: "rect" },
  },
  // No fundingSource here — see FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE's comment on
  // AllButtons.
  AllButtons: {},
  // No style/fundingSource. applePayDisplayName overridable per merchant via
  // PAYPAL_BUTTON_CONFIG.ApplePay.applePayDisplayName.
  ApplePay: {
    applePayDisplayName: "My Store",
  },
  //no config needed, added for consistency
  CardFieldsStored: {},
  Venmo: {},
  Credit: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  Ideal: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  Bancontact: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  Eps: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  MyBank: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  P24: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  Blik: {
    style: { buttonColor: "blue", buttonLabel: "pay", buttonShape: "rect" },
  },
  GooglePay: {},
  PayUponInvoice: {},
};

// RenderTemplate/resolveOptions.ts's scriptOptions — plain defaults applied to every payment method.
export const DEFAULT_SCRIPT_CURRENCY = "EUR";

export function buildScriptOptions(
  baseOptions: BaseOptions,
  componentSdkOptions: Record<string, unknown> | undefined,
  isExpress = false
): ReactPayPalScriptOptions {
  return {
    clientId: baseOptions.clientId || "",
    currency: DEFAULT_SCRIPT_CURRENCY,
    ...(isExpress && baseOptions.redirectOnApprove ? { commit: false } : {}),
    ...(!isExpress && baseOptions.standardScriptOptions),
    ...componentSdkOptions,
  };
}
