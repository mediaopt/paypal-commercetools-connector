export class CAPTUREFULLYREFUNDED {
  'issue'?: CAPTUREFULLYREFUNDED.IssueEnum;
  'description'?: CAPTUREFULLYREFUNDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CAPTUREFULLYREFUNDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'CAPTUREFULLYREFUNDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CAPTUREFULLYREFUNDED.attributeTypeMap;
  }
}

export namespace CAPTUREFULLYREFUNDED {
  export enum IssueEnum {
    CaptureFullyRefunded = <any>'CAPTURE_FULLY_REFUNDED',
  }
  export enum DescriptionEnum {
    TheCaptureHasAlreadyBeenFullyRefunded = <any>(
      'The capture has already been fully refunded'
    ),
  }
}
