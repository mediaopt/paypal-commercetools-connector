export class INVALIDPARAMETERVALUE {
  'issue'?: INVALIDPARAMETERVALUE.IssueEnum;
  'description'?: INVALIDPARAMETERVALUE.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'INVALIDPARAMETERVALUE.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'INVALIDPARAMETERVALUE.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDPARAMETERVALUE.attributeTypeMap;
  }
}

export namespace INVALIDPARAMETERVALUE {
  export enum IssueEnum {
    InvalidParameterValue = <any>'INVALID_PARAMETER_VALUE',
  }
  export enum DescriptionEnum {
    TheValueOfAFieldIsInvalid = <any>'The value of a field is invalid.',
  }
}
