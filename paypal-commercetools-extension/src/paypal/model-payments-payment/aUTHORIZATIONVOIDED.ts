export class AUTHORIZATIONVOIDED {
  'issue'?: AUTHORIZATIONVOIDED.IssueEnum;
  'description'?: AUTHORIZATIONVOIDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHORIZATIONVOIDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHORIZATIONVOIDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHORIZATIONVOIDED.attributeTypeMap;
  }
}

export namespace AUTHORIZATIONVOIDED {
  export enum IssueEnum {
    AuthorizationVoided = <any>'AUTHORIZATION_VOIDED',
  }
  export enum DescriptionEnum {
    AVoidedAuthorizationCannotBeCapturedOrReauthorized = <any>(
      'A voided authorization cannot be captured or reauthorized. '
    ),
  }
}
