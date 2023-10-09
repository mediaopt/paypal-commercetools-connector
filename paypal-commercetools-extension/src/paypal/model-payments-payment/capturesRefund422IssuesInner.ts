export class CapturesRefund422IssuesInner {
  'issue'?: CapturesRefund422IssuesInner.IssueEnum;
  'description'?: CapturesRefund422IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CapturesRefund422IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'CapturesRefund422IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CapturesRefund422IssuesInner.attributeTypeMap;
  }
}

export namespace CapturesRefund422IssuesInner {
  export enum IssueEnum {
    PlatformFeeNotEnabled = <any>'PLATFORM_FEE_NOT_ENABLED',
  }
  export enum DescriptionEnum {
    TheApiCallerAccountIsNotSetupToBeAbleToProcessRefundsWithPlatformFeesPleaseContactYourAccountManagerThisFeatureIsUsefulWhenYouWantToContributeAPortionOfThePlatformFeesYouHadCaptureAsPartOfTheRefundBeingProcessed = <
      any
    >"The API Caller account is not setup to be able to process refunds with 'platform_fees'. Please contact your Account Manager. This feature is useful when you want to contribute a portion of the 'platform_fees' you had capture as part of the refund being processed.",
  }
}
