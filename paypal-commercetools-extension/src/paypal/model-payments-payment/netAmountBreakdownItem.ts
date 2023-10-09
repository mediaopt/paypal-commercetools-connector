import { ExchangeRate } from './exchangeRate';
import { Money } from './money';

/**
 * The net amount. Returned when the currency of the refund is different from the currency of the PayPal account where the merchant holds their funds.
 */
export class NetAmountBreakdownItem {
  'payableAmount'?: Money;
  'convertedAmount'?: Money;
  'exchangeRate'?: ExchangeRate;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'payableAmount',
      baseName: 'payable_amount',
      type: 'Money',
    },
    {
      name: 'convertedAmount',
      baseName: 'converted_amount',
      type: 'Money',
    },
    {
      name: 'exchangeRate',
      baseName: 'exchange_rate',
      type: 'ExchangeRate',
    },
  ];

  static getAttributeTypeMap() {
    return NetAmountBreakdownItem.attributeTypeMap;
  }
}
