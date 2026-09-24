import {
  PaymentMethodType,
  StandardPaymentMethodType,
} from "../dtos/paypal-payment.dto";

const PAYMENT_METHOD_ICON_KEY_MAP: Record<PaymentMethodType, string> = {
  [StandardPaymentMethodType.CREDIT_CARD]: "card",
  [StandardPaymentMethodType.PAYPAL]: "paypal",
  [StandardPaymentMethodType.APPLE_PAY]: "applepay",
  [StandardPaymentMethodType.GOOGLE_PAY]: "googlepay",
  [StandardPaymentMethodType.PAY_UPON_INVOICE]:
    StandardPaymentMethodType.PAY_UPON_INVOICE,
  // Venmo has no commercetools icon-key equivalent — see paypal-payment.dto.ts.
};

export const toPaymentMethodIconKey = (type: PaymentMethodType): string =>
  PAYMENT_METHOD_ICON_KEY_MAP[type];
