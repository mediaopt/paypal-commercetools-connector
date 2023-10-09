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

export class MISSINGREQUIREDPARAMETER2 {
  'issue'?: MISSINGREQUIREDPARAMETER2.IssueEnum;
  'description'?: MISSINGREQUIREDPARAMETER2.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MISSINGREQUIREDPARAMETER2.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MISSINGREQUIREDPARAMETER2.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MISSINGREQUIREDPARAMETER2.attributeTypeMap;
  }
}

export namespace MISSINGREQUIREDPARAMETER2 {
  export enum IssueEnum {
    MissingRequiredParameter = <any>'MISSING_REQUIRED_PARAMETER',
  }
  export enum DescriptionEnum {
    ARequiredFieldParameterIsMissing = <any>(
      'A required field / parameter is missing'
    ),
  }
}