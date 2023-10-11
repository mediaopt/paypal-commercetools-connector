/**
 * The exchange rate that determines the amount to convert from one currency to another currency.
 */
export class ExchangeRate {
  /**
   * The [three-character ISO-4217 currency code](/api/rest/reference/currency-codes/) that identifies the currency.
   */
  'sourceCurrency'?: string;
  /**
   * The [three-character ISO-4217 currency code](/api/rest/reference/currency-codes/) that identifies the currency.
   */
  'targetCurrency'?: string;
  /**
   * The target currency amount. Equivalent to one unit of the source currency. Formatted as integer or decimal value with one to 15 digits to the right of the decimal point.
   */
  'value'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'sourceCurrency',
      baseName: 'source_currency',
      type: 'string',
    },
    {
      name: 'targetCurrency',
      baseName: 'target_currency',
      type: 'string',
    },
    {
      name: 'value',
      baseName: 'value',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return ExchangeRate.attributeTypeMap;
  }
}
