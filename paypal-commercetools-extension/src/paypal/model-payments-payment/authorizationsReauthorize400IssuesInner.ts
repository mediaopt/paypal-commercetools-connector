export class AuthorizationsReauthorize400IssuesInner {
  'issue'?: AuthorizationsReauthorize400IssuesInner.IssueEnum;
  'description'?: AuthorizationsReauthorize400IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AuthorizationsReauthorize400IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AuthorizationsReauthorize400IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsReauthorize400IssuesInner.attributeTypeMap;
  }
}

export namespace AuthorizationsReauthorize400IssuesInner {
  export enum IssueEnum {
    InvalidParameterSyntax = <any>'INVALID_PARAMETER_SYNTAX',
  }
  export enum DescriptionEnum {
    TheValueOfAFieldDoesNotConformToTheExpectedFormat = <any>(
      'The value of a field does not conform to the expected format.'
    ),
  }
}
