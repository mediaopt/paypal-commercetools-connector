export class AuthorizationsReauthorize422IssuesInner {
  'issue'?: AuthorizationsReauthorize422IssuesInner.IssueEnum;
  'description'?: AuthorizationsReauthorize422IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'AuthorizationsReauthorize422IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'AuthorizationsReauthorize422IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsReauthorize422IssuesInner.attributeTypeMap;
  }
}

export namespace AuthorizationsReauthorize422IssuesInner {
  export enum IssueEnum {
    AuthCurrencyMismatch = <any>'AUTH_CURRENCY_MISMATCH',
  }
  export enum DescriptionEnum {
    TheCurrencySpecifiedDuringReauthorizationShouldBeTheSameAsTheCurrencySpecifiedInTheOriginalAuthorizationPleaseCheckTheCurrencyOfTheAuthorizationForWhichYouAreTryingToReauthorizeAndTryAgain = <
      any
    >'The currency specified during reauthorization should be the same as the currency specified in the original authorization. Please check the currency of the authorization for which you are trying to reauthorize and try again.',
  }
}
