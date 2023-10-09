export class CANNOTBEVOIDED {
  'issue'?: CANNOTBEVOIDED.IssueEnum;
  'description'?: CANNOTBEVOIDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CANNOTBEVOIDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'CANNOTBEVOIDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CANNOTBEVOIDED.attributeTypeMap;
  }
}

export namespace CANNOTBEVOIDED {
  export enum IssueEnum {
    CannotBeVoided = <any>'CANNOT_BE_VOIDED',
  }
  export enum DescriptionEnum {
    AReauthorizationCannotBeVoidedPleaseVoidTheOriginalParentAuthorization = <
      any
    >'A reauthorization cannot be voided. Please void the original parent authorization.',
  }
}
