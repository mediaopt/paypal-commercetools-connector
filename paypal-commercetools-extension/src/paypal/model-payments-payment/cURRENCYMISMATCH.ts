export class CURRENCYMISMATCH {
  'issue'?: CURRENCYMISMATCH.IssueEnum;
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
      type: 'CURRENCYMISMATCH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CURRENCYMISMATCH.attributeTypeMap;
  }
}

export namespace CURRENCYMISMATCH {
  export enum IssueEnum {
    CurrencyMismatch = <any>'CURRENCY_MISMATCH',
  }
}
