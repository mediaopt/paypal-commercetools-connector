/**
 * Orders
 * An order represents a payment between two or more parties. Use the Orders API to create, update, retrieve, authorize, and capture orders.
 *
 * The version of the OpenAPI document: 2.13
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Information needed to pay using giropay.
 */
export class Giropay {
  /**
   * The full name representation like Mr J Smith.
   */
  'name'?: string;
  /**
   * The [two-character ISO 3166-1 code](/api/rest/reference/country-codes/) that identifies the country or region.<blockquote><strong>Note:</strong> The country code for Great Britain is <code>GB</code> and not <code>UK</code> as used in the top-level domain names for that country. Use the `C2` country code for China worldwide for comparable uncontrolled price (CUP) method, bank card, and cross-border transactions.</blockquote>
   */
  'countryCode'?: string;
  /**
   * The business identification code (BIC). In payments systems, a BIC is used to identify a specific business, most commonly a bank.
   */
  'bic'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'name',
      baseName: 'name',
      type: 'string',
    },
    {
      name: 'countryCode',
      baseName: 'country_code',
      type: 'string',
    },
    {
      name: 'bic',
      baseName: 'bic',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return Giropay.attributeTypeMap;
  }
}
