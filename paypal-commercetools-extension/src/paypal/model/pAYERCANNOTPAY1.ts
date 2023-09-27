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

export class PAYERCANNOTPAY1 {
  'issue'?: PAYERCANNOTPAY1.IssueEnum;
  'description'?: PAYERCANNOTPAY1.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PAYERCANNOTPAY1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PAYERCANNOTPAY1.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PAYERCANNOTPAY1.attributeTypeMap;
  }
}

export namespace PAYERCANNOTPAY1 {
  export enum IssueEnum {
    PayerCannotPay = <any>'PAYER_CANNOT_PAY',
  }
  export enum DescriptionEnum {
    PayerCannotPayForThisTransactionPleaseContactThePayerToFindOtherWaysToPayForThisTransaction = <
      any
    >'Payer cannot pay for this transaction. Please contact the payer to find other ways to pay for this transaction.',
  }
}
