import {
  PaymentMethodType,
  StandardPaymentMethodType,
  StoredPaymentMethodType,
} from "../dtos/paypal-payment.dto";

const PAYMENT_METHOD_ICON_KEY_MAP: Record<PaymentMethodType, string> = {
  [StandardPaymentMethodType.CREDIT_CARD]: "card",
  [StandardPaymentMethodType.PAYPAL]: "paypal",
  // No commercetools icon-key equivalent for these — see paypal-payment.dto.ts.
  [StandardPaymentMethodType.SEPA]: StandardPaymentMethodType.SEPA,
  [StandardPaymentMethodType.PAY_LATER]: StandardPaymentMethodType.PAY_LATER,
  [StandardPaymentMethodType.PAYPAL_CREDIT_CARD]:
    StandardPaymentMethodType.PAYPAL_CREDIT_CARD,
  [StandardPaymentMethodType.ALL_BUTTONS]:
    StandardPaymentMethodType.ALL_BUTTONS,
  [StandardPaymentMethodType.VENMO]: StandardPaymentMethodType.VENMO,
  // APPLE_PAY: [StandardPaymentMethodType.APPLE_PAY]: "applepay",
  // GOOGLE_PAY: [StandardPaymentMethodType.GOOGLE_PAY]: "googlepay",
  // Maps the same as CreditCard/CardFields since the stored variant is distinguished by using a
  // separate builder (createStoredPaymentMethodBuilder), not a different icon; kept for Record
  // completeness.
  [StoredPaymentMethodType.CREDIT_CARD_STORED]: "card",
};

export const toPaymentMethodIconKey = (type: PaymentMethodType): string =>
  PAYMENT_METHOD_ICON_KEY_MAP[type];
