export class Model409IssuesInner {
  'issue'?: Model409IssuesInner.IssueEnum;
  'description'?: Model409IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model409IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model409IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model409IssuesInner.attributeTypeMap;
  }
}

export namespace Model409IssuesInner {
  export enum IssueEnum {
    PreviousRequestInProgress = <any>'PREVIOUS_REQUEST_IN_PROGRESS',
  }
  export enum DescriptionEnum {
    APreviousRequestOnThisResourceIsCurrentlyInProgressPleaseWaitForSometimeAndTryAgainItIsBestToSpaceOutTheInitialAndTheSubsequentRequestSToAvoidReceivingThisError = <
      any
    >'A previous request on this resource is currently in progress. Please wait for sometime and try again. It is best to space out the initial and the subsequent request(s) to avoid receiving this error.',
  }
}
