import { PaymentResult } from "./enabler";
import { CreatePaymentResponse, GetSettingsResponse } from "../../types";

type ComponentSdkOptions = Record<string, unknown>;

/**
 * PayPal JS SDK script-level options (currency, components, enableFunding/disableFunding, etc.),
 * keyed by paymentMethodType — sourced from the processor's `/operations/config` response, see
 * PAYPAL_SDK_OPTIONS in processor/.env.template. PayPalExpress is the one dedicated exception,
 * since only PayPal's own component with builderType: "express" needs its own slot — see
 * RenderTemplate/resolveOptions.ts.
 */
export type PayPalSdkOptions = Partial<Record<string, ComponentSdkOptions>> & {
  PayPalExpress?: ComponentSdkOptions;
};

export type BaseOptions = {
  processorUrl: string;
  sessionId: string;
  storedPaymentMethodsEnabled?: boolean;
  enableVaulting?: boolean;
  purchaseCallback?: (result: PaymentResult, options: any) => void;
  sdkOptions?: PayPalSdkOptions;
  /** PayPal client id from `/operations/config`, used to load the PayPal JS SDK script. */
  clientId?: string;
  /**
   * Merchant settings from the processor's `/operations/config` response — seeds
   * SettingsProvider's `settings` state.
   */
  settings: GetSettingsResponse;
  /** PayPal SDK identity token from `/operations/config`, when a vaulted PayPal customer exists. */
  userIdToken?: string;
  /** Shared PayPal JS SDK script options for every *standard* component (PayPal, Sepa, PayLater,
   * PayPalCreditCard, AllButtons, Venmo, CardFields, ApplePay) — computed server-side, in
   * PayPalPaymentService.config(), from PAYPAL_STANDARD_SCRIPT_OPTIONS narrowed by
   * settings.acceptCredit. Used by every non-express resolver's buildScriptOptions()  and stored payment methods call so every
   * concurrently-mounted standard component's PayPalScriptProvider requests the identical SDK
   * script, avoiding a window.paypal race across separately-mounted components. PayPal Express
   * (a different page) don't use this. */
  standardScriptOptions: { components?: string[]; disableFunding?: string[] };
  /** When true express PayPal payment is redirected to merchant side for approval */
  redirectOnApprove?: boolean;
  /** The commercetools Payment for this checkout page load — created once in PayPalPaymentEnabler._Setup(),
   * alongside the /operations/config fetch, and shared by every builder resolving this same BaseOptions object.*/
  initialPayment: CreatePaymentResponse;
};
