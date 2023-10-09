export class PARTIALREFUNDNOTALLOWED {
  'issue'?: PARTIALREFUNDNOTALLOWED.IssueEnum;
  'description'?: PARTIALREFUNDNOTALLOWED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PARTIALREFUNDNOTALLOWED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PARTIALREFUNDNOTALLOWED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PARTIALREFUNDNOTALLOWED.attributeTypeMap;
  }
}

export namespace PARTIALREFUNDNOTALLOWED {
  export enum IssueEnum {
    PartialRefundNotAllowed = <any>'PARTIAL_REFUND_NOT_ALLOWED',
  }
  export enum DescriptionEnum {
    YouCannotDoARefundLessThanTheOriginalCaptureAmount = <any>(
      'You cannot do a refund less than the original capture amount.'
    ),
  }
}
