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
   * PAYPAL_EXPRESS_SDK_OPTIONS — see PayPalBuilder.ts's express branch. Flat, not keyed by
   * componentType: Express is the only component that ever reads this field, since every other
   * (standard) component instead shares paypalScriptOptions below. */
  expressSdkOptions?: ComponentSdkOptions;
  /** PayPal client id from `/operations/config`, used to load the PayPal JS SDK script. */
  clientId?: string;
  /**
   * Merchant settings from the processor's `/operations/config` response — seeds
   * SettingsProvider's `settings` state.
   */
  settings?: GetSettingsResponse;
  /** PayPal SDK identity token from `/operations/config`, when a vaulted PayPal customer exists. */
  userIdToken?: string;
  /** The ONE PayPal JS SDK script config every standard (non-express) component uses — resolved
   * once in PayPalPaymentEnabler._Setup() and preloaded there (see preloadPayPalScript.ts) before
   * any component ever mounts, so every concurrently-mounted standard component's
   * <PayPalScriptProvider> requests the identical, already-loaded SDK script instead of racing to
   * load it independently. Deliberately includes intent/dataPartnerAttributionId/merchantId
   * already baked in, computed identically to what useSettings.tsx's own <PayPalScriptProvider>
   * merge produces for a standard component — see that merge's own comment for why matching
   * matters here. PayPal Express is excluded — it always mounts alone (its own page, no
   * concurrent-mount risk) and needs genuinely different options, so it keeps resolving and
   * loading its own script independently via expressSdkOptions above. */
  paypalScriptOptions: ReactPayPalScriptOptions;
  /** PayPal Express only, from `/operations/config`'s `redirectOnApprove` (processor's
   * PAYPAL_REDIRECT_ON_APPROVE) — when true, `handleOnApprove` calls `expressApprove` and
   * redirects instead of authorizing/capturing immediately. */
  redirectOnApprove?: boolean;
  /** The commercetools Payment for this checkout page load — created once in
   * PayPalPaymentEnabler._Setup(), alongside the /operations/config fetch, and shared by every
   * builder resolving this same BaseOptions object. */
  initialPayment: CreatePaymentResponse;
};
