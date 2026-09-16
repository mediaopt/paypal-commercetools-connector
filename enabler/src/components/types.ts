export type PayPalPaymentMethodType =
  | "PayPal"
  | "CardFields"
  | "ApplePay"
  | "GooglePay"
  | "PayUponInvoice"
  | "Venmo";
// Not "PaymentTokens" — stored/vaulted payment methods have their own separate interface
// (StoredComponentBuilder / createStoredPaymentMethodBuilder), not this one.

export type PayPalPaymentMethodExpressType = Extract<
  PayPalPaymentMethodType,
  "PayPal"
>;
