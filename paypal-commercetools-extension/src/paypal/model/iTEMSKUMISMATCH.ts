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

export class ITEMSKUMISMATCH {
  'issue'?: ITEMSKUMISMATCH.IssueEnum;
  'description'?: ITEMSKUMISMATCH.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'ITEMSKUMISMATCH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'ITEMSKUMISMATCH.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return ITEMSKUMISMATCH.attributeTypeMap;
  }
}

export namespace ITEMSKUMISMATCH {
  export enum IssueEnum {
    ItemSkuMismatch = <any>'ITEM_SKU_MISMATCH',
  }
  export enum DescriptionEnum {
    ItemSkuMustMatchOneOfTheItemsSkuThatWasProvidedDuringOrderCreation = <any>(
      'Item sku must match one of the items sku that was provided during order creation.'
    ),
  }
}
