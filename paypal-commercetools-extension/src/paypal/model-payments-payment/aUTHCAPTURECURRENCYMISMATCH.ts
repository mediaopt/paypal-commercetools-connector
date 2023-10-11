export class AUTHCAPTURECURRENCYMISMATCH {
  'issue'?: AUTHCAPTURECURRENCYMISMATCH.IssueEnum;
  'description'?: AUTHCAPTURECURRENCYMISMATCH.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHCAPTURECURRENCYMISMATCH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHCAPTURECURRENCYMISMATCH.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHCAPTURECURRENCYMISMATCH.attributeTypeMap;
  }
}

export namespace AUTHCAPTURECURRENCYMISMATCH {
  export enum IssueEnum {
    AuthCaptureCurrencyMismatch = <any>'AUTH_CAPTURE_CURRENCY_MISMATCH',
  }
  export enum DescriptionEnum {
    CurrencyOfCaptureMustBeTheSameAsCurrencyOfAuthorization = <any>(
      'Currency of capture must be the same as currency of authorization.'
    ),
  }
}
