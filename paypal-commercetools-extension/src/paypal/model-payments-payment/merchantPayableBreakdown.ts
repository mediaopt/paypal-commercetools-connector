import { Money } from './money';
import { NetAmountBreakdownItem } from './netAmountBreakdownItem';
import { PlatformFee } from './platformFee';

/**
 * The breakdown of the refund.
 */
export class MerchantPayableBreakdown {
  'grossAmount'?: Money;
  'paypalFee'?: Money;
  'paypalFeeInReceivableCurrency'?: Money;
  'netAmount'?: Money;
  'netAmountInReceivableCurrency'?: Money;
  /**
   * An array of platform or partner fees, commissions, or brokerage fees for the refund.
   */
  'platformFees'?: Array<PlatformFee>;
  /**
   * An array of breakdown values for the net amount. Returned when the currency of the refund is different from the currency of the PayPal account where the payee holds their funds.
   */
  'netAmountBreakdown'?: Array<NetAmountBreakdownItem>;
  'totalRefundedAmount'?: Money;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'grossAmount',
      baseName: 'gross_amount',
      type: 'Money',
    },
    {
      name: 'paypalFee',
      baseName: 'paypal_fee',
      type: 'Money',
    },
    {
      name: 'paypalFeeInReceivableCurrency',
      baseName: 'paypal_fee_in_receivable_currency',
      type: 'Money',
    },
    {
      name: 'netAmount',
      baseName: 'net_amount',
      type: 'Money',
    },
    {
      name: 'netAmountInReceivableCurrency',
      baseName: 'net_amount_in_receivable_currency',
      type: 'Money',
    },
    {
      name: 'platformFees',
      baseName: 'platform_fees',
      type: 'Array<PlatformFee>',
    },
    {
      name: 'netAmountBreakdown',
      baseName: 'net_amount_breakdown',
      type: 'Array<NetAmountBreakdownItem>',
    },
    {
      name: 'totalRefundedAmount',
      baseName: 'total_refunded_amount',
      type: 'Money',
    },
  ];

  static getAttributeTypeMap() {
    return MerchantPayableBreakdown.attributeTypeMap;
  }
}