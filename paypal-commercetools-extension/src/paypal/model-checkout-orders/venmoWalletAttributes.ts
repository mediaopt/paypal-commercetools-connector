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

import { Customer } from './customer';
import { VaultVenmoWalletBase } from './vaultVenmoWalletBase';

/**
 * Additional attributes associated with the use of this Venmo Wallet.
 */
export class VenmoWalletAttributes {
  'customer'?: Customer;
  'vault'?: VaultVenmoWalletBase;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'customer',
      baseName: 'customer',
      type: 'Customer',
    },
    {
      name: 'vault',
      baseName: 'vault',
      type: 'VaultVenmoWalletBase',
    },
  ];

  static getAttributeTypeMap() {
    return VenmoWalletAttributes.attributeTypeMap;
  }
}