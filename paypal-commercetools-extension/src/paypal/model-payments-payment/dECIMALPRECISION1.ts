export class DECIMALPRECISION1 {
  'issue'?: DECIMALPRECISION1.IssueEnum;
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
      type: 'DECIMALPRECISION1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return DECIMALPRECISION1.attributeTypeMap;
  }
}

export namespace DECIMALPRECISION1 {
  export enum IssueEnum {
    DecimalPrecision = <any>'DECIMAL_PRECISION',
  }
}
