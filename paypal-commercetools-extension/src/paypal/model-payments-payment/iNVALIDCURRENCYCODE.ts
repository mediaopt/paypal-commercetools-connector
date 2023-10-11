export class INVALIDCURRENCYCODE {
  'issue'?: INVALIDCURRENCYCODE.IssueEnum;
  'description'?: INVALIDCURRENCYCODE.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'INVALIDCURRENCYCODE.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'INVALIDCURRENCYCODE.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDCURRENCYCODE.attributeTypeMap;
  }
}

export namespace INVALIDCURRENCYCODE {
  export enum IssueEnum {
    InvalidCurrencyCode = <any>'INVALID_CURRENCY_CODE',
  }
  export enum DescriptionEnum {
    CurrencyCodeIsInvalidOrIsNotCurrentlySupportedPleaseReferHttpsDeveloperPaypalComDocsApiReferenceCurrencyCodesForListOfSupportedCurrencyCodes = <
      any
    >'Currency code is invalid or is not currently supported. Please refer https://developer.paypal.com/docs/api/reference/currency-codes/ for list of supported currency codes.',
  }
}
