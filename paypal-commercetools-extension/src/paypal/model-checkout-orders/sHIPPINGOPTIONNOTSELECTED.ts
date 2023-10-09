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

export class SHIPPINGOPTIONNOTSELECTED {
  'issue'?: SHIPPINGOPTIONNOTSELECTED.IssueEnum;
  'description'?: SHIPPINGOPTIONNOTSELECTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'SHIPPINGOPTIONNOTSELECTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'SHIPPINGOPTIONNOTSELECTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return SHIPPINGOPTIONNOTSELECTED.attributeTypeMap;
  }
}

export namespace SHIPPINGOPTIONNOTSELECTED {
  export enum IssueEnum {
    ShippingOptionNotSelected = <any>'SHIPPING_OPTION_NOT_SELECTED',
  }
  export enum DescriptionEnum {
    AtLeastOneOfTheShippingOptionShouldBeSetToSelectedTrue = <any>(
      "At least one of the shipping.option should be set to 'selected = true'."
    ),
  }
}