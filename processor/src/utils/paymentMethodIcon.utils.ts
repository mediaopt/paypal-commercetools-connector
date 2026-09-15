import {
  PaymentMethodType,
  StandardPaymentMethodType,
} from "../dtos/paypal-payment.dto";

const PAYMENT_METHOD_ICON_KEY_MAP: Record<PaymentMethodType, string> = {
  [StandardPaymentMethodType.CREDIT_CARD]: "card",
  [StandardPaymentMethodType.PAYPAL]: "paypal",
  // APPLE_PAY: [StandardPaymentMethodType.APPLE_PAY]: "applepay",
  // GOOGLE_PAY: [StandardPaymentMethodType.GOOGLE_PAY]: "googlepay",
  // Venmo/PayUponInvoice have no commercetools icon-key equivalent — see paypal-payment.dto.ts.
};

export const toPaymentMethodIconKey = (type: PaymentMethodType): string =>
  PAYMENT_METHOD_ICON_KEY_MAP[type];
