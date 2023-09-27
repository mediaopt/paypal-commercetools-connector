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

export class MSPNOTSUPPORTED {
  'issue'?: MSPNOTSUPPORTED.IssueEnum;
  'description'?: MSPNOTSUPPORTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MSPNOTSUPPORTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MSPNOTSUPPORTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MSPNOTSUPPORTED.attributeTypeMap;
  }
}

export namespace MSPNOTSUPPORTED {
  export enum IssueEnum {
    MspNotSupported = <any>'MSP_NOT_SUPPORTED',
  }
  export enum DescriptionEnum {
    MultiplePurchaseUnitsAreNotSupportedForThisOperation = <any>(
      'Multiple purchase units are not supported for this operation.'
    ),
  }
}
