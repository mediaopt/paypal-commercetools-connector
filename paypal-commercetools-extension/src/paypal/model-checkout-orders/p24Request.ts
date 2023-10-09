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

import { ExperienceContextBase } from './experienceContextBase';

/**
 * Information needed to pay using P24 (Przelewy24).
 */
export class P24Request {
  /**
   * The full name representation like Mr J Smith.
   */
  'name': string;
  /**
   * The internationalized email address.<blockquote><strong>Note:</strong> Up to 64 characters are allowed before and 255 characters are allowed after the <code>@</code> sign. However, the generally accepted maximum length for an email address is 254 characters. The pattern verifies that an unquoted <code>@</code> sign exists.</blockquote>
   */
  'email': string;
  /**
   * The [two-character ISO 3166-1 code](/api/rest/reference/country-codes/) that identifies the country or region.<blockquote><strong>Note:</strong> The country code for Great Britain is <code>GB</code> and not <code>UK</code> as used in the top-level domain names for that country. Use the `C2` country code for China worldwide for comparable uncontrolled price (CUP) method, bank card, and cross-border transactions.</blockquote>
   */
  'countryCode': string;
  'experienceContext'?: ExperienceContextBase;

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
      name: 'email',
      baseName: 'email',
      type: 'string',
    },
    {
      name: 'countryCode',
      baseName: 'country_code',
      type: 'string',
    },
    {
      name: 'experienceContext',
      baseName: 'experience_context',
      type: 'ExperienceContextBase',
    },
  ];

  static getAttributeTypeMap() {
    return P24Request.attributeTypeMap;
  }
}