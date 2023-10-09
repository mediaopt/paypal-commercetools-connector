export class PLATFORMFEEEXCEEDED {
  'issue'?: PLATFORMFEEEXCEEDED.IssueEnum;
  'description'?: PLATFORMFEEEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PLATFORMFEEEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PLATFORMFEEEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PLATFORMFEEEXCEEDED.attributeTypeMap;
  }
}

export namespace PLATFORMFEEEXCEEDED {
  export enum IssueEnum {
    PlatformFeeExceeded = <any>'PLATFORM_FEE_EXCEEDED',
  }
  export enum DescriptionEnum {
    PlatformFeeAmountSpecifiedExceedsTheAmountThatIsAvailableForRefundYouCanOnlyRefundUpToTheAvailablePlatformFeeAmountThisErrorIsAlsoReturnedWhenNoPlatformFeeWasSpecifiedOrWasZeroWhenThePaymentWasCaptured = <
      any
    >'Platform fee amount specified exceeds the amount that is available for refund. You can only refund up to the available platform fee amount. This error is also returned when no platform_fee was specified or was zero when the payment was captured.',
  }
}
