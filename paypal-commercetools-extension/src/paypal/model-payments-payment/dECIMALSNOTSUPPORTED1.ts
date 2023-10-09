export class DECIMALSNOTSUPPORTED1 {
  'issue'?: DECIMALSNOTSUPPORTED1.IssueEnum;
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
      type: 'DECIMALSNOTSUPPORTED1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return DECIMALSNOTSUPPORTED1.attributeTypeMap;
  }
}

export namespace DECIMALSNOTSUPPORTED1 {
  export enum IssueEnum {
    DecimalsNotSupported = <any>'DECIMALS_NOT_SUPPORTED',
  }
}
