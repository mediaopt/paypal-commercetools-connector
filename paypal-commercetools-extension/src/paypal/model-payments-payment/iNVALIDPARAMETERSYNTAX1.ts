export class INVALIDPARAMETERSYNTAX1 {
  'issue'?: INVALIDPARAMETERSYNTAX1.IssueEnum;
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
      type: 'INVALIDPARAMETERSYNTAX1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDPARAMETERSYNTAX1.attributeTypeMap;
  }
}

export namespace INVALIDPARAMETERSYNTAX1 {
  export enum IssueEnum {
    InvalidParameterSyntax = <any>'INVALID_PARAMETER_SYNTAX',
  }
}
