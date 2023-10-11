export class CANNOTBEZEROORNEGATIVE1 {
  'issue'?: CANNOTBEZEROORNEGATIVE1.IssueEnum;
  'description'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CANNOTBEZEROORNEGATIVE1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CANNOTBEZEROORNEGATIVE1.attributeTypeMap;
  }
}

export namespace CANNOTBEZEROORNEGATIVE1 {
  export enum IssueEnum {
    CannotBeZeroOrNegative = <any>'CANNOT_BE_ZERO_OR_NEGATIVE',
  }
}
