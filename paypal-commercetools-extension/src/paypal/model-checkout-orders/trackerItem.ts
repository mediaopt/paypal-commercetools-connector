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
 * The details of the items in the shipment.
 */
export class TrackerItem {
  /**
   * The item name or title.
   */
  'name'?: string;
  /**
   * The item quantity. Must be a whole number.
   */
  'quantity'?: string;
  /**
   * The stock keeping unit (SKU) for the item. This can contain unicode characters.
   */
  'sku'?: string;
  /**
   * The URL of the item\'s image. File type and size restrictions apply. An image that violates these restrictions will not be honored.
   */
  'imageUrl'?: string;
  'upc'?: any | null;

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
      name: 'quantity',
      baseName: 'quantity',
      type: 'string',
    },
    {
      name: 'sku',
      baseName: 'sku',
      type: 'string',
    },
    {
      name: 'imageUrl',
      baseName: 'image_url',
      type: 'string',
    },
    {
      name: 'upc',
      baseName: 'upc',
      type: 'any',
    },
  ];

  static getAttributeTypeMap() {
    return TrackerItem.attributeTypeMap;
  }
}