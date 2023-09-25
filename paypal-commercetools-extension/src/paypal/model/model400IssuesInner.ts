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

export class Model400IssuesInner {
  'issue'?: Model400IssuesInner.IssueEnum;
  'description'?: Model400IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model400IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model400IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model400IssuesInner.attributeTypeMap;
  }
}

export namespace Model400IssuesInner {
  export enum IssueEnum {
    MalformedRequestJson = <any>'MALFORMED_REQUEST_JSON',
  }
  export enum DescriptionEnum {
    TheRequestJsonIsNotWellFormed = <any>'The request JSON is not well formed.',
  }
}
