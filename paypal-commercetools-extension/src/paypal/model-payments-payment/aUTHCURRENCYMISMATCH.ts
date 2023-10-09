export class AUTHCURRENCYMISMATCH {
  'issue'?: AUTHCURRENCYMISMATCH.IssueEnum;
  'description'?: AUTHCURRENCYMISMATCH.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AUTHCURRENCYMISMATCH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AUTHCURRENCYMISMATCH.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AUTHCURRENCYMISMATCH.attributeTypeMap;
  }
}

export namespace AUTHCURRENCYMISMATCH {
  export enum IssueEnum {
    AuthCurrencyMismatch = <any>'AUTH_CURRENCY_MISMATCH',
  }
  export enum DescriptionEnum {
    TheCurrencySpecifiedDuringReauthorizationShouldBeTheSameAsTheCurrencySpecifiedInTheOriginalAuthorizationPleaseCheckTheCurrencyOfTheAuthorizationForWhichYouAreTryingToReauthorizeAndTryAgain = <
      any
    >'The currency specified during reauthorization should be the same as the currency specified in the original authorization. Please check the currency of the authorization for which you are trying to reauthorize and try again.',
  }
}
