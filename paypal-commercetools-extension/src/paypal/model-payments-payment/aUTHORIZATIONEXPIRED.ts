export class AUTHORIZATIONEXPIRED {
  'issue'?: AUTHORIZATIONEXPIRED.IssueEnum;
  'description'?: AUTHORIZATIONEXPIRED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHORIZATIONEXPIRED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHORIZATIONEXPIRED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHORIZATIONEXPIRED.attributeTypeMap;
  }
}

export namespace AUTHORIZATIONEXPIRED {
  export enum IssueEnum {
    AuthorizationExpired = <any>'AUTHORIZATION_EXPIRED',
  }
  export enum DescriptionEnum {
    AnExpiredAuthorizationCannotBeCaptured = <any>(
      'An expired authorization cannot be captured.'
    ),
  }
}
