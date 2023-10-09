export class INVALIDSTRINGLENGTH1 {
  'issue'?: INVALIDSTRINGLENGTH1.IssueEnum;
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
      type: 'INVALIDSTRINGLENGTH1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDSTRINGLENGTH1.attributeTypeMap;
  }
}

export namespace INVALIDSTRINGLENGTH1 {
  export enum IssueEnum {
    InvalidStringLength = <any>'INVALID_STRING_LENGTH',
  }
}
