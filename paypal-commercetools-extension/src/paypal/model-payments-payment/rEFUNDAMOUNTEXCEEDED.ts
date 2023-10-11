export class REFUNDAMOUNTEXCEEDED {
  'issue'?: REFUNDAMOUNTEXCEEDED.IssueEnum;
  'description'?: REFUNDAMOUNTEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDAMOUNTEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDAMOUNTEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDAMOUNTEXCEEDED.attributeTypeMap;
  }
}

export namespace REFUNDAMOUNTEXCEEDED {
  export enum IssueEnum {
    RefundAmountExceeded = <any>'REFUND_AMOUNT_EXCEEDED',
  }
  export enum DescriptionEnum {
    TheRefundAmountMustBeLessThanOrEqualToTheCaptureAmountThatHasNotYetBeenRefunded = <
      any
    >'The refund amount must be less than or equal to the capture amount that has not yet been refunded.',
  }
}
