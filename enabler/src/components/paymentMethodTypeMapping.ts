import { PayPalPaymentMethodType } from "../types";

const CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE: Record<string, PayPalPaymentMethodType> = {
  card: "CardFields",
  paypal: "PayPal",
  applepay: "ApplePay",
  googlepay: "GooglePay",
  ideal: "Ideal",
  bancontact: "Bancontact",
  eps: "Eps",
  mybank: "MyBank",
  p24: "P24",
  blik: "Blik",
};

export const toPayPalPaymentMethodType = (type: string): PayPalPaymentMethodType =>
  CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE[type] ?? (type as PayPalPaymentMethodType);
