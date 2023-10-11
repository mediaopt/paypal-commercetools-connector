export class AUTHORIZATIONALREADYCAPTURED {
  'issue'?: AUTHORIZATIONALREADYCAPTURED.IssueEnum;
  'description'?: AUTHORIZATIONALREADYCAPTURED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHORIZATIONALREADYCAPTURED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHORIZATIONALREADYCAPTURED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHORIZATIONALREADYCAPTURED.attributeTypeMap;
  }
}

export namespace AUTHORIZATIONALREADYCAPTURED {
  export enum IssueEnum {
    AuthorizationAlreadyCaptured = <any>'AUTHORIZATION_ALREADY_CAPTURED',
  }
  export enum DescriptionEnum {
    AuthorizationHasPreviouslyBeenCaptured = <any>(
      'Authorization has previously been captured.'
    ),
  }
}
