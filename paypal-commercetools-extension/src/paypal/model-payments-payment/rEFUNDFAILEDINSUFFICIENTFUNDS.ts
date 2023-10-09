export class REFUNDFAILEDINSUFFICIENTFUNDS {
  'issue'?: REFUNDFAILEDINSUFFICIENTFUNDS.IssueEnum;
  'description'?: REFUNDFAILEDINSUFFICIENTFUNDS.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDFAILEDINSUFFICIENTFUNDS.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDFAILEDINSUFFICIENTFUNDS.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDFAILEDINSUFFICIENTFUNDS.attributeTypeMap;
  }
}

export namespace REFUNDFAILEDINSUFFICIENTFUNDS {
  export enum IssueEnum {
    RefundFailedInsufficientFunds = <any>'REFUND_FAILED_INSUFFICIENT_FUNDS',
  }
  export enum DescriptionEnum {
    CaptureCouldNotBeRefundedDueToInsufficientFundsPleaseCheckToSeeIfYouHaveSufficientFundsInYourPayPalAccountOrIfTheBankAccountLinkedToYourPayPalAccountIsVerifiedAndHasSufficientFunds = <
      any
    >'Capture could not be refunded due to insufficient funds. Please check to see if you have sufficient funds in your PayPal account or if the bank account linked to your PayPal account is verified and has sufficient funds.',
  }
}
