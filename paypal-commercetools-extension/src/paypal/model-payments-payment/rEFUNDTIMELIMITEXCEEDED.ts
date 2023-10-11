export class REFUNDTIMELIMITEXCEEDED {
  'issue'?: REFUNDTIMELIMITEXCEEDED.IssueEnum;
  'description'?: REFUNDTIMELIMITEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDTIMELIMITEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDTIMELIMITEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDTIMELIMITEXCEEDED.attributeTypeMap;
  }
}

export namespace REFUNDTIMELIMITEXCEEDED {
  export enum IssueEnum {
    RefundTimeLimitExceeded = <any>'REFUND_TIME_LIMIT_EXCEEDED',
  }
  export enum DescriptionEnum {
    YouAreOverTheTimeLimitToPerformARefundOnThisCapture = <any>(
      'You are over the time limit to perform a refund on this capture'
    ),
  }
}
