export class MAXCAPTURECOUNTEXCEEDED {
  'issue'?: MAXCAPTURECOUNTEXCEEDED.IssueEnum;
  'description'?: MAXCAPTURECOUNTEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MAXCAPTURECOUNTEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MAXCAPTURECOUNTEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MAXCAPTURECOUNTEXCEEDED.attributeTypeMap;
  }
}

export namespace MAXCAPTURECOUNTEXCEEDED {
  export enum IssueEnum {
    MaxCaptureCountExceeded = <any>'MAX_CAPTURE_COUNT_EXCEEDED',
  }
  export enum DescriptionEnum {
    MaxmimumNumberOfAllowableCapturesHasBeenReachedNoAdditionalCapturesArePossibleForThisAuthorizationContactCustomerServiceOrYourAccountManagerToChangeTheNumberOfCapturesForAGivenAuthorization = <
      any
    >'Maxmimum number of allowable captures has been reached. No additional captures are possible for this authorization. Contact Customer Service or your account manager to change the number of captures for a given authorization.',
  }
}
