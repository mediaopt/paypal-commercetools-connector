export class DECIMALSNOTSUPPORTED {
  'issue'?: DECIMALSNOTSUPPORTED.IssueEnum;
  'description'?: DECIMALSNOTSUPPORTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'DECIMALSNOTSUPPORTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'DECIMALSNOTSUPPORTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return DECIMALSNOTSUPPORTED.attributeTypeMap;
  }
}

export namespace DECIMALSNOTSUPPORTED {
  export enum IssueEnum {
    DecimalsNotSupported = <any>'DECIMALS_NOT_SUPPORTED',
  }
  export enum DescriptionEnum {
    CurrencyDoesNotSupportDecimalsPleaseReferToHttpsDeveloperPaypalComDocsApiReferenceCurrencyCodesForMoreInformation = <
      any
    >'Currency does not support decimals. Please refer to https://developer.paypal.com/docs/api/reference/currency-codes/ for more information.',
  }
}
