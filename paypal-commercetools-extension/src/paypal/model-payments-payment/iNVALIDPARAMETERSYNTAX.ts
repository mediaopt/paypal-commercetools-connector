export class INVALIDPARAMETERSYNTAX {
  'issue'?: INVALIDPARAMETERSYNTAX.IssueEnum;
  'description'?: INVALIDPARAMETERSYNTAX.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'INVALIDPARAMETERSYNTAX.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'INVALIDPARAMETERSYNTAX.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDPARAMETERSYNTAX.attributeTypeMap;
  }
}

export namespace INVALIDPARAMETERSYNTAX {
  export enum IssueEnum {
    InvalidParameterSyntax = <any>'INVALID_PARAMETER_SYNTAX',
  }
  export enum DescriptionEnum {
    TheValueOfAFieldDoesNotConformToTheExpectedFormat = <any>(
      'The value of a field does not conform to the expected format.'
    ),
  }
}
