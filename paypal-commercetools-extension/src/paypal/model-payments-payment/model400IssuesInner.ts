export class Model400IssuesInner {
  'issue'?: Model400IssuesInner.IssueEnum;
  'description'?: Model400IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model400IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model400IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model400IssuesInner.attributeTypeMap;
  }
}

export namespace Model400IssuesInner {
  export enum IssueEnum {
    InvalidParameterSyntax = <any>'INVALID_PARAMETER_SYNTAX',
  }
  export enum DescriptionEnum {
    TheValueOfAFieldDoesNotConformToTheExpectedFormat = <any>(
      'The value of a field does not conform to the expected format.'
    ),
  }
}
