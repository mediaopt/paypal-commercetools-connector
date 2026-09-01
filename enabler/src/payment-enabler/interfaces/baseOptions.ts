import { PaymentResult } from "./enabler";
import { GetSettingsResponse } from "../../types";

type ComponentSdkOptions = Record<string, unknown>;

/**
 * PayPal JS SDK script-level options (currency, components, enableFunding/disableFunding, etc.),
 * keyed by paymentMethodType — sourced from the processor's `/operations/config` response, see
 * PAYPAL_SDK_OPTIONS in processor/.env.template. PayPalExpress is the one dedicated exception,
 * since only PayPal's own component with builderType: "express" needs its own slot — see
 * PayPalBuilder.ts.
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
  settings?: GetSettingsResponse;
  /** PayPal SDK identity token from `/operations/config`, when a vaulted PayPal customer exists. */
  userIdToken?: string;
  /** PayPal Express only, from `/operations/config`'s `redirectOnApprove` (processor's
   * PAYPAL_REDIRECT_ON_APPROVE) — when true, `handleOnApprove` calls `expressApprove` and
   * redirects instead of authorizing/capturing immediately. */
  redirectOnApprove?: boolean;
};
