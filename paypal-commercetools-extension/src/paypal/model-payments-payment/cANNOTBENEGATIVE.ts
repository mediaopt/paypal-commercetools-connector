export class CANNOTBENEGATIVE {
  'issue'?: CANNOTBENEGATIVE.IssueEnum;
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
      type: 'CANNOTBENEGATIVE.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CANNOTBENEGATIVE.attributeTypeMap;
  }
}

export namespace CANNOTBENEGATIVE {
  export enum IssueEnum {
    CannotBeNegative = <any>'CANNOT_BE_NEGATIVE',
  }
}
