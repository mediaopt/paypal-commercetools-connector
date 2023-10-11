export class REFUNDNOTALLOWED {
  'issue'?: REFUNDNOTALLOWED.IssueEnum;
  'description'?: REFUNDNOTALLOWED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDNOTALLOWED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDNOTALLOWED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDNOTALLOWED.attributeTypeMap;
  }
}

export namespace REFUNDNOTALLOWED {
  export enum IssueEnum {
    RefundNotAllowed = <any>'REFUND_NOT_ALLOWED',
  }
  export enum DescriptionEnum {
    CaptureCannotBeRefunded = <any>'Capture cannot be refunded.',
  }
}
