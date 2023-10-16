import { TransactionState, TypedMoney } from '@commercetools/platform-sdk';
import { OrderStatus } from '../paypal/model-checkout-orders/orderStatus';
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
  fractionDigits: number | undefined
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
