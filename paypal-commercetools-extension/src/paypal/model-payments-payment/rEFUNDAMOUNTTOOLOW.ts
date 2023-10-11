export class REFUNDAMOUNTTOOLOW {
  'issue'?: REFUNDAMOUNTTOOLOW.IssueEnum;
  'description'?: REFUNDAMOUNTTOOLOW.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDAMOUNTTOOLOW.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDAMOUNTTOOLOW.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDAMOUNTTOOLOW.attributeTypeMap;
  }
}

export namespace REFUNDAMOUNTTOOLOW {
  export enum IssueEnum {
    RefundAmountTooLow = <any>'REFUND_AMOUNT_TOO_LOW',
  }
  export enum DescriptionEnum {
    TheAmountAfterApplyingCurrencyConversionIsZeroAndHenceTheCaptureCannotBeRefundedTheCurrencyConversionIsRequiredBecauseTheCurrencyOfTheCaptureIsDifferentThanTheCurrencyInWhichTheAmountWasSettledIntoThePayeeAccount = <
      any
    >'The amount after applying currency conversion is zero and hence the capture cannot be refunded. The currency conversion is required because the currency of the capture is different than the currency in which the amount was settled into the payee account.',
  }
}
