export class MISSINGREQUIREDPARAMETER1 {
  'issue'?: MISSINGREQUIREDPARAMETER1.IssueEnum;
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
      type: 'MISSINGREQUIREDPARAMETER1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return MISSINGREQUIREDPARAMETER1.attributeTypeMap;
  }
}

export namespace MISSINGREQUIREDPARAMETER1 {
  export enum IssueEnum {
    MissingRequiredParameter = <any>'MISSING_REQUIRED_PARAMETER',
  }
}
