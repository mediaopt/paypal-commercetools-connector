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

import { VaultResponse } from './vaultResponse';

/**
 * Additional attributes associated with the use of this card.
 */
export class CardAttributesResponse {
  'vault'?: VaultResponse;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'vault',
      baseName: 'vault',
      type: 'VaultResponse',
    },
  ];

  static getAttributeTypeMap() {
    return CardAttributesResponse.attributeTypeMap;
  }
}
