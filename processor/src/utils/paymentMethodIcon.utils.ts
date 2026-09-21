import {
  PaymentMethodType,
  StandardPaymentMethodType,
  StoredPaymentMethodType,
} from "../dtos/paypal-payment.dto";

const PAYMENT_METHOD_ICON_KEY_MAP: Record<PaymentMethodType, string> = {
  [StandardPaymentMethodType.CREDIT_CARD]: "card",
  [StandardPaymentMethodType.PAYPAL]: "paypal",
  // No commercetools icon-key equivalent for these — see paypal-payment.dto.ts.
  [StandardPaymentMethodType.SEPA]: "sepa",
  [StandardPaymentMethodType.PAY_LATER]: StandardPaymentMethodType.PAY_LATER,
  [StandardPaymentMethodType.PAYPAL_CREDIT_CARD]:
    StandardPaymentMethodType.PAYPAL_CREDIT_CARD,
  [StandardPaymentMethodType.ALL_BUTTONS]:
    StandardPaymentMethodType.ALL_BUTTONS,
  [StandardPaymentMethodType.VENMO]: StandardPaymentMethodType.VENMO,
  [StandardPaymentMethodType.CREDIT]: StandardPaymentMethodType.CREDIT,
  [StandardPaymentMethodType.APPLE_PAY]: "applepay",
  [StandardPaymentMethodType.GOOGLE_PAY]: "googlepay",
  [StandardPaymentMethodType.PAY_UPON_INVOICE]:
    StandardPaymentMethodType.PAY_UPON_INVOICE,
  // Local payment methods (APMs)
  [StandardPaymentMethodType.IDEAL]: "ideal",
  [StandardPaymentMethodType.BANCONTACT]: "bancontactcard",
  [StandardPaymentMethodType.EPS]: "eps",
  [StandardPaymentMethodType.MYBANK]: "mybank",
  [StandardPaymentMethodType.P24]: "przelewy24",
  [StandardPaymentMethodType.BLIK]: "blik",

  // Maps the same as CreditCard/CardFields since the stored variant is distinguished by using a
  // separate builder (createStoredPaymentMethodBuilder), not a different icon; kept for Record
  // completeness.
  [StoredPaymentMethodType.CREDIT_CARD_STORED]: "card",
};

export const toPaymentMethodIconKey = (type: PaymentMethodType): string =>
  PAYMENT_METHOD_ICON_KEY_MAP[type];
