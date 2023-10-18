import { TransactionState, TypedMoney } from '@commercetools/platform-sdk';
import { OrderStatus } from '../paypal/model-checkout-orders/orderStatus';
import { PaymentSourceResponse } from '../paypal/model-checkout-orders/paymentSourceResponse';
import { Capture2 } from '../paypal/model-payments-payment/capture2';
import { Refund } from '../paypal/model-payments-payment/refund';
import StatusEnum = Refund.StatusEnum;

export const mapCommercetoolsMoneyToPayPalMoney = (
  amountPlanned: TypedMoney
): string => {
  return String(
    amountPlanned.centAmount * Math.pow(10, -amountPlanned.fractionDigits || 0)
  );
};

export const mapPayPalMoneyToCommercetoolsMoney = (
  amount: string,
  fractionDigits?: number
): number => {
  return parseFloat(amount) * Math.pow(10, fractionDigits ?? 0);
};

export const mapPayPalRefundStatusToCommercetoolsTransactionState = (
  status?: StatusEnum
): TransactionState => {
  switch (status) {
    case StatusEnum.Completed:
      return 'Success';
    case StatusEnum.Cancelled:
    case StatusEnum.Failed:
    case undefined:
      return 'Failure';
    default:
      return 'Pending';
  }
};

export const mapPayPalCaptureStatusToCommercetoolsTransactionState = (
  status?: Capture2.StatusEnum
): TransactionState => {
  switch (status) {
    case Capture2.StatusEnum.Completed:
    case Capture2.StatusEnum.Refunded:
    case Capture2.StatusEnum.PartiallyRefunded:
      return 'Success';
    case Capture2.StatusEnum.Declined:
    case Capture2.StatusEnum.Failed:
    case undefined:
      return 'Failure';
    case Capture2.StatusEnum.Pending:
    default:
      return 'Pending';
  }
};
export const mapPayPalOrderStatusToCommercetoolsTransactionState = (
  status?: OrderStatus
): TransactionState => {
  switch (status) {
    case OrderStatus.Created:
      return 'Initial';
    case OrderStatus.Saved:
    case OrderStatus.Approved:
    case OrderStatus.Completed:
    case OrderStatus.Voided:
      return 'Success';
    case undefined:
      return 'Failure';
    case OrderStatus.PayerActionRequired:
    default:
      return 'Pending';
  }
};

export const mapPayPalPaymentSourceToCommercetoolsMethodInfo = (
  source: PaymentSourceResponse
): string => {
  if (source.card) {
    return `Card (${source.card.name})`;
  }
  if (source.eps) {
    return `eps (${source.eps.name})`;
  }
  if (source.bancontact) {
    return `Bancontact (${source.bancontact.cardLastDigits})`;
  }
  if (source.blik) {
    return `BLIK (${source.blik.name})`;
  }
  if (source.p24) {
    return `p24 (${source.p24.email})`;
  }
  if (source.giropay) {
    return `giropay (${source.giropay.name})`;
  }
  if (source.ideal) {
    return `iDEAL (${source.ideal.ibanLastChars})`;
  }
  if (source.mybank) {
    return `MyBank (${source.mybank.ibanLastChars})`;
  }
  if (source.paypal) {
    return `PayPal (${source.paypal.emailAddress})`;
  }
  if (source.sofort) {
    return `SOFORT (${source.sofort.ibanLastChars})`;
  }
  if (source.trustly) {
    return `trustly (${source.trustly.ibanLastChars})`;
  }
  if (source.venmo) {
    return `Venmo (${source.venmo.emailAddress})`;
  }
  return '';
};
