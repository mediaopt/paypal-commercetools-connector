export class AuthorizationsVoid422IssuesInner {
  'issue'?: AuthorizationsVoid422IssuesInner.IssueEnum;
  'description'?: AuthorizationsVoid422IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AuthorizationsVoid422IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AuthorizationsVoid422IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsVoid422IssuesInner.attributeTypeMap;
  }
}

export namespace AuthorizationsVoid422IssuesInner {
  export enum IssueEnum {
    CannotBeVoided = <any>'CANNOT_BE_VOIDED',
  }
  export enum DescriptionEnum {
    AReauthorizationCannotBeVoidedPleaseVoidTheOriginalParentAuthorization = <
      any
    >'A reauthorization cannot be voided. Please void the original parent authorization.',
  }
}
