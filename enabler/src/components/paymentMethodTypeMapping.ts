import { PayPalPaymentMethodType } from "../types";

const CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE: Record<
  string,
  PayPalPaymentMethodType
> = {
  card: "CardFields",
  paypal: "PayPal",
  ideal: "Ideal",
  bancontactcard: "Bancontact",
  eps: "Eps",
  mybank: "MyBank",
  przelewy24: "P24",
  blik: "Blik",
  sepa: "Sepa",
};

export const toPayPalPaymentMethodType = (
  type: string
): PayPalPaymentMethodType =>
  CT_ICON_KEY_TO_PAYMENT_METHOD_TYPE[type] ?? (type as PayPalPaymentMethodType);
