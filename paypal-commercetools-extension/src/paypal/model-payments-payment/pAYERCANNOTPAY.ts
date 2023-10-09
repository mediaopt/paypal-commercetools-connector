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
    PayerCannotPayForThisTransactionPleaseContactThePayerToFindOtherWaysToPayForThisTransaction = <
      any
    >'Payer cannot pay for this transaction. Please contact the payer to find other ways to pay for this transaction.',
  }
}
