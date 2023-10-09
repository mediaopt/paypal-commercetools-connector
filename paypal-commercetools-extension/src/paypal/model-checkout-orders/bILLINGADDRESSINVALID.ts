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

export class BILLINGADDRESSINVALID {
  'issue'?: BILLINGADDRESSINVALID.IssueEnum;
  'description'?: BILLINGADDRESSINVALID.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'BILLINGADDRESSINVALID.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'BILLINGADDRESSINVALID.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return BILLINGADDRESSINVALID.attributeTypeMap;
  }
}

export namespace BILLINGADDRESSINVALID {
  export enum IssueEnum {
    BillingAddressInvalid = <any>'BILLING_ADDRESS_INVALID',
  }
  export enum DescriptionEnum {
    ProvidedBillingAddressIsInvalid = <any>(
      'Provided billing address is invalid.'
    ),
  }
}