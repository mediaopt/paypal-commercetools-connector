export class INVALIDCURRENCYCODE1 {
  'issue'?: INVALIDCURRENCYCODE1.IssueEnum;
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
      type: 'INVALIDCURRENCYCODE1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDCURRENCYCODE1.attributeTypeMap;
  }
}

export namespace INVALIDCURRENCYCODE1 {
  export enum IssueEnum {
    InvalidCurrencyCode = <any>'INVALID_CURRENCY_CODE',
  }
}
