export class MISSINGREQUIREDPARAMETER {
  'issue'?: MISSINGREQUIREDPARAMETER.IssueEnum;
  'description'?: MISSINGREQUIREDPARAMETER.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MISSINGREQUIREDPARAMETER.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MISSINGREQUIREDPARAMETER.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MISSINGREQUIREDPARAMETER.attributeTypeMap;
  }
}

export namespace MISSINGREQUIREDPARAMETER {
  export enum IssueEnum {
    MissingRequiredParameter = <any>'MISSING_REQUIRED_PARAMETER',
  }
  export enum DescriptionEnum {
    ARequiredFieldParameterIsMissing = <any>(
      'A required field / parameter is missing.'
    ),
  }
}
