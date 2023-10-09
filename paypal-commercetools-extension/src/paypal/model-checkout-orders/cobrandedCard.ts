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

import { Money } from './money';
import { PayeeBase } from './payeeBase';

/**
 * Details about the merchant cobranded card used for order purchase.
 */
export class CobrandedCard {
  /**
   * Array of labels for the cobranded card.
   */
  'labels'?: Array<string>;
  'payee'?: PayeeBase;
  'amount'?: Money;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'labels',
      baseName: 'labels',
      type: 'Array<string>',
    },
    {
      name: 'payee',
      baseName: 'payee',
      type: 'PayeeBase',
    },
    {
      name: 'amount',
      baseName: 'amount',
      type: 'Money',
    },
  ];

  static getAttributeTypeMap() {
    return CobrandedCard.attributeTypeMap;
  }
}