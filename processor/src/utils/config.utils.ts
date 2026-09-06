import { getConfig } from "../config/config";
import { getStoredPaymentMethodsConfig } from "../config/stored-payment-methods.config";
import { ConfigResponse } from "../services/types/operation.type";
import { StandardPaymentMethodType } from "../dtos/paypal-payment.dto";

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
 * Overlays cart-derived currency onto every component's PayPal SDK script options (standard and
 * PayPalExpress alike) — cart data wins when available, PAYPAL_SDK_OPTIONS/defaults stay as the
 * fallback. buyerCountry is additionally overlaid, but only onto the standard components, and only
 * in sandbox — PayPal's own docs say not to pass it in production at all ("used only in the
 * sandbox"), and Express is a separate page/script with no reason to share this. Not merchant-
 * configurable: applied last, after `configured[componentType]`, same as currency always was.
 */
export const buildSdkOptions = (cartSummary?: {
  country?: string;
  currency?: string;
}): ConfigResponse["sdkOptions"] => {
  const configured = getConfig().sdkOptions;
  if (!cartSummary) {
    return configured;
  }

  const currencyOption: Record<string, unknown> = cartSummary.currency
    ? { currency: cartSummary.currency }
    : {};
  const isSandbox = getConfig().paypalEnvironment.toLowerCase() === "sandbox";
  const standardOptions: Record<string, unknown> = {
    ...currencyOption,
    ...(isSandbox && cartSummary.country
      ? { buyerCountry: cartSummary.country }
      : {}),
  };

  if (!Object.keys(currencyOption).length && !Object.keys(standardOptions).length) {
    return configured;
  }

  // Every componentType (PayPal, CardFields, and any future member) gets the overlay generically;
  // PayPalExpress is the one dedicated exception — see PayPalBuilder.ts's express-first resolution.
  const overlaid = Object.fromEntries(
    Object.values(StandardPaymentMethodType).map((componentType) => [
      componentType,
      { ...configured[componentType], ...standardOptions },
    ])
  );

  return {
    ...configured,
    ...overlaid,
    PayPalExpress: { ...configured.PayPalExpress, ...currencyOption },
  };
};
