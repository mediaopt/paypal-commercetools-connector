import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import { PaymentResult } from "./enabler";
import { CreatePaymentResponse, GetSettingsResponse } from "../../types";

type ComponentSdkOptions = Record<string, unknown>;

export type BaseOptions = {
  processorUrl: string;
  sessionId: string;
  storedPaymentMethodsEnabled?: boolean;
  enableVaulting?: boolean;
  purchaseCallback?: (result: PaymentResult, options: any) => void;
  /** PayPal Express's own PayPal JS SDK script options, from the processor's
   * PAYPAL_EXPRESS_SDK_OPTIONS — see resolveOptions.ts's express branch. Flat, not keyed by
   * paymentMethodType: Express is the only paymentMethodType that ever reads this field, since
   * every other (standard) method instead shares paypalScriptOptions below. */
  expressSdkOptions?: ComponentSdkOptions;
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
   * PayPalCreditCard, AllButtons, Venmo, CardFields, ApplePay, CardFieldsStored) — computed
   * server-side, in PayPalPaymentService.config()*/
  standardScriptOptions: ComponentSdkOptions & {
    components?: string[];
    disableFunding?: string[];
    enableFunding?: string[];
  };
  /**
   * The ONE PayPal JS SDK script config every standard (non-express, non-stored) component uses —
   * resolved once in PayPalPaymentEnabler._Setup. Deliberately includes
   * intent/dataPartnerAttributionId/merchantId already baked in, computed identically to what
   * useSettings.tsx's <PayPalScriptProvider>.
   *
   * PayPal Express is excluded — it always must mount alone (no concurrent-mount risk) and needs
   * genuinely different options*/
  paypalScriptOptions: ReactPayPalScriptOptions;
  /** When true express PayPal payment is redirected to merchant side for approval */
  redirectOnApprove?: boolean;
  /** The commercetools Payment for this checkout page load — created once in PayPalPaymentEnabler._Setup(),
   * alongside the /operations/config fetch, and shared by every builder resolving this same BaseOptions object.*/
  initialPayment: CreatePaymentResponse;
};
