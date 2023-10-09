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

export class MISSINGCRYPTOGRAM {
  'issue'?: MISSINGCRYPTOGRAM.IssueEnum;
  'description'?: MISSINGCRYPTOGRAM.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MISSINGCRYPTOGRAM.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MISSINGCRYPTOGRAM.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MISSINGCRYPTOGRAM.attributeTypeMap;
  }
}

export namespace MISSINGCRYPTOGRAM {
  export enum IssueEnum {
    MissingCryptogram = <any>'MISSING_CRYPTOGRAM',
  }
  export enum DescriptionEnum {
    CryptogramIsMandatoryForAnyCustomerInitiatedNetworkTokenTransactions = <
      any
    >'Cryptogram is mandatory for any customer initiated network token transactions.',
  }
}