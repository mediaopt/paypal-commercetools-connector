/**
 * The currency and amount for a financial transaction, such as a balance or payment due.
 */
export class Money {
  /**
   * The [three-character ISO-4217 currency code](/api/rest/reference/currency-codes/) that identifies the currency.
   */
  'currencyCode': string;
  /**
   * The value, which might be:<ul><li>An integer for currencies like `JPY` that are not typically fractional.</li><li>A decimal fraction for currencies like `TND` that are subdivided into thousandths.</li></ul>For the required number of decimal places for a currency code, see [Currency Codes](/api/rest/reference/currency-codes/).
   */
  'value': string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'currencyCode',
      baseName: 'currency_code',
      type: 'string',
    },
    {
      name: 'value',
      baseName: 'value',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return Money.attributeTypeMap;
  }
}
