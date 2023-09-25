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

export class PAYERCANNOTPAY {
  'issue'?: PAYERCANNOTPAY.IssueEnum;
  'description'?: PAYERCANNOTPAY.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PAYERCANNOTPAY.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PAYERCANNOTPAY.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PAYERCANNOTPAY.attributeTypeMap;
  }
}

export namespace PAYERCANNOTPAY {
  export enum IssueEnum {
    PayerCannotPay = <any>'PAYER_CANNOT_PAY',
  }
  export enum DescriptionEnum {
    CombinationOfPayerAndPayeeSettingsMeanThatThisBuyerCannotPayThisSeller = <
      any
    >'Combination of payer and payee settings mean that this buyer cannot pay this seller.',
  }
}
