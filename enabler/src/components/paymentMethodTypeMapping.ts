import { PayPalPaymentMethodType } from "../types";

const CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE: Record<string, PayPalPaymentMethodType> = {
  card: "CardFields",
  paypal: "PayPal",
};

export const toPayPalPaymentMethodType = (type: string): PayPalPaymentMethodType =>
  CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE[type] ?? (type as PayPalPaymentMethodType);
