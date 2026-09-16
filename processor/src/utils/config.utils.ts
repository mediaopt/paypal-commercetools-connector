import { getConfig } from "../config/config";
import { getStoredPaymentMethodsConfig } from "../config/stored-payment-methods.config";
import { ConfigResponse } from "../services/types/operation.type";

/**
 * Indicates if the feature stored payment methods is enabled/available.
 * It can be enhanced with further checks if so required.
 */
export const isStoredPaymentMethodsEnabled = (cartSummary?: {
  customerId?: string;
}): boolean => {
  if (!getStoredPaymentMethodsConfig().enabled) {
    return false;
  }

  return cartSummary?.customerId !== undefined;
};

/**
 * Cart-derived overlay for the shared standard script config (PAYPAL_STANDARD_SCRIPT_OPTIONS) —
 * cart data wins over the configured/default values when available. currency comes from the
 * cart's total price; buyerCountry only in sandbox — PayPal's own docs say not to pass it in
 * production at all ("used only in the sandbox"). Express is a separate page/script with its own
 * config (see buildExpressSdkOptions below) and doesn't share this overlay.
 */
export const buildStandardScriptCartOverlay = (cartSummary?: {
  country?: string;
  currency?: string;
}): Record<string, unknown> => {
  const configured = getConfig().standardScriptOptions;
  if (!cartSummary) {
    return configured;
  }

  const isSandbox = getConfig().paypalEnvironment.toLowerCase() === "sandbox";
  return {
    ...configured,
    ...(cartSummary.currency ? { currency: cartSummary.currency } : {}),
    ...(isSandbox && cartSummary.country
      ? { buyerCountry: cartSummary.country }
      : {}),
  };
};

/**
 * PayPal Express's own PayPal JS SDK script options (PAYPAL_EXPRESS_SDK_OPTIONS) — kept separate
 * from the shared standard ones above since Express mounts on its own page/script and genuinely
 * needs different values.
 */
export const buildExpressSdkOptions = (cartSummary?: {
  currency?: string;
}): ConfigResponse["expressSdkOptions"] => {
  const configured = getConfig().expressSdkOptions;
  return cartSummary?.currency
    ? { ...configured, currency: cartSummary.currency }
    : configured;
};
