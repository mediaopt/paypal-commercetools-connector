export class PREVIOUSREQUESTINPROGRESS {
  'issue'?: PREVIOUSREQUESTINPROGRESS.IssueEnum;
  'description'?: PREVIOUSREQUESTINPROGRESS.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PREVIOUSREQUESTINPROGRESS.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PREVIOUSREQUESTINPROGRESS.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PREVIOUSREQUESTINPROGRESS.attributeTypeMap;
  }
}

export namespace PREVIOUSREQUESTINPROGRESS {
  export enum IssueEnum {
    PreviousRequestInProgress = <any>'PREVIOUS_REQUEST_IN_PROGRESS',
  }
  export enum DescriptionEnum {
    APreviousRequestOnThisResourceIsCurrentlyInProgressPleaseWaitForSometimeAndTryAgainItIsBestToSpaceOutTheInitialAndTheSubsequentRequestSToAvoidReceivingThisError = <
      any
    >'A previous request on this resource is currently in progress. Please wait for sometime and try again. It is best to space out the initial and the subsequent request(s) to avoid receiving this error.',
  }
}
