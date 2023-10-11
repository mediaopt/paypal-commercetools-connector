export class CapturesRefund400IssuesInner {
  'issue'?: CapturesRefund400IssuesInner.IssueEnum;
  'description'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CapturesRefund400IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CapturesRefund400IssuesInner.attributeTypeMap;
  }
}

export namespace CapturesRefund400IssuesInner {
  export enum IssueEnum {
    InvalidStringLength = <any>'INVALID_STRING_LENGTH',
  }
}
