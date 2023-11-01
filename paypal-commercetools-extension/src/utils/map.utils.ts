import {
  LineItem,
  TransactionState,
  TypedMoney,
} from '@commercetools/platform-sdk';
import {
  Item,
  OrderStatus,
  PaymentSourceResponse,
} from '../paypal/checkout_api';
import {
  Authorization2StatusEnum,
  Capture2StatusEnum,
  RefundStatusEnum,
} from '../paypal/payments_api';

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
  status?: RefundStatusEnum
): TransactionState => {
  switch (status) {
    case RefundStatusEnum.Completed:
      return 'Success';
    case RefundStatusEnum.Cancelled:
    case RefundStatusEnum.Failed:
    case undefined:
      return 'Failure';
    case RefundStatusEnum.Pending:
    default:
      return 'Pending';
  }
};

export const mapPayPalCaptureStatusToCommercetoolsTransactionState = (
  status?: Capture2StatusEnum
): TransactionState => {
  switch (status) {
    case Capture2StatusEnum.Completed:
    case Capture2StatusEnum.Refunded:
    case Capture2StatusEnum.PartiallyRefunded:
      return 'Success';
    case Capture2StatusEnum.Declined:
    case Capture2StatusEnum.Failed:
    case undefined:
      return 'Failure';
    case Capture2StatusEnum.Pending:
    default:
      return 'Pending';
  }
};

export const mapPayPalAuthorizationStatusToCommercetoolsTransactionState = (
  status?: Authorization2StatusEnum
): TransactionState => {
  switch (status) {
    case Authorization2StatusEnum.Voided:
    case Authorization2StatusEnum.Captured:
    case Authorization2StatusEnum.PartiallyCaptured:
    case Authorization2StatusEnum.Created:
      return 'Success';
    case Authorization2StatusEnum.Denied:
    case undefined:
      return 'Failure';
    case Authorization2StatusEnum.Pending:
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
    return `Bancontact (${source.bancontact.card_last_digits})`;
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
    return `iDEAL (${source.ideal.iban_last_chars})`;
  }
  if (source.mybank) {
    return `MyBank (${source.mybank.iban_last_chars})`;
  }
  if (source.paypal) {
    return `PayPal (${source.paypal.email_address})`;
  }
  if (source.sofort) {
    return `SOFORT (${source.sofort.iban_last_chars})`;
  }
  if (source.trustly) {
    return `trustly (${source.trustly.iban_last_chars})`;
  }
  if (source.venmo) {
    return `Venmo (${source.venmo.email_address})`;
  }
  return '';
};

export const mapCommercetoolsLineItemsToPayPalItems = (
  lineItem: LineItem,
  locale?: string
): Item => {
  const name = lineItem.name[locale ?? Object.keys(lineItem.name)[0]];
  return {
    unit_amount: {
      value: mapCommercetoolsMoneyToPayPalMoney(lineItem.price.value),
      currency_code: lineItem.price.value.currencyCode,
    },
    name: name,
    sku: lineItem.variant.sku,
    quantity: `${lineItem.quantity}`,
    description: name,
  };
};
