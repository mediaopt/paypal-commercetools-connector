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

export class CARDEXPIRYREQUIRED {
  'issue'?: CARDEXPIRYREQUIRED.IssueEnum;
  'description'?: CARDEXPIRYREQUIRED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CARDEXPIRYREQUIRED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'CARDEXPIRYREQUIRED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CARDEXPIRYREQUIRED.attributeTypeMap;
  }
}

export namespace CARDEXPIRYREQUIRED {
  export enum IssueEnum {
    CardExpiryRequired = <any>'CARD_EXPIRY_REQUIRED',
  }
  export enum DescriptionEnum {
    TheCardExpiryIsRequiredWhenAttemptingToProcessPaymentWithCard = <any>(
      'The card expiry is required when attempting to process payment with card.'
    ),
  }
}
