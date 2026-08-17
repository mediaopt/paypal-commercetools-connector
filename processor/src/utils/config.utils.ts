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

  return {
    ...configured,
    PayPal: {
      standard: { ...configured.PayPal?.standard, ...cartOptions },
      express: { ...configured.PayPal?.express, ...cartOptions },
    },
    CardFields: { ...configured.CardFields, ...cartOptions },
  };
};
