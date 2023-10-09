export class AUTHORIZATIONDENIED {
  'issue'?: AUTHORIZATIONDENIED.IssueEnum;
  'description'?: AUTHORIZATIONDENIED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHORIZATIONDENIED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHORIZATIONDENIED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHORIZATIONDENIED.attributeTypeMap;
  }
}

export namespace AUTHORIZATIONDENIED {
  export enum IssueEnum {
    AuthorizationDenied = <any>'AUTHORIZATION_DENIED',
  }
  export enum DescriptionEnum {
    AnDeniedAuthorizationCannotBeCaptured = <any>(
      'An denied authorization cannot be captured.'
    ),
  }
}
