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
 * Overlays cart-derived currency/buyerCountry onto every component's PayPal SDK script
 * options — cart data wins when available, PAYPAL_SDK_OPTIONS/defaults stay as the fallback.
 */
export const buildSdkOptions = (cartSummary?: {
  country?: string;
  currency?: string;
}): ConfigResponse["sdkOptions"] => {
  const configured = getConfig().sdkOptions;
  if (!cartSummary) {
    return configured;
  }

  const cartOptions: Record<string, unknown> = {};
  if (cartSummary.currency) {
    cartOptions.currency = cartSummary.currency;
  }
  if (cartSummary.country) {
    cartOptions.buyerCountry = cartSummary.country;
  }
  if (!Object.keys(cartOptions).length) {
    return configured;
  }

  // Every componentType (PayPal, CardFields, and any future member) gets the overlay generically;
  // PayPalExpress is the one dedicated exception — see PayPalBuilder.ts's express-first resolution.
  const overlaid = Object.fromEntries(
    Object.values(StandardPaymentMethodType).map((componentType) => [
      componentType,
      { ...configured[componentType], ...cartOptions },
    ])
  );

  return {
    ...configured,
    ...overlaid,
    PayPalExpress: { ...configured.PayPalExpress, ...cartOptions },
  };
};
