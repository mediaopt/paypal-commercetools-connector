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

export class OrdersConfirm400IssuesInner {
  'issue'?: OrdersConfirm400IssuesInner.IssueEnum;
  'description'?: OrdersConfirm400IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'OrdersConfirm400IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'OrdersConfirm400IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return OrdersConfirm400IssuesInner.attributeTypeMap;
  }
}

export namespace OrdersConfirm400IssuesInner {
  export enum IssueEnum {
    MalformedRequestJson = <any>'MALFORMED_REQUEST_JSON',
  }
  export enum DescriptionEnum {
    TheRequestJsonIsNotWellFormed = <any>'The request JSON is not well formed.',
  }
}
