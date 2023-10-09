export class MAXNUMBEROFREFUNDSEXCEEDED {
  'issue'?: MAXNUMBEROFREFUNDSEXCEEDED.IssueEnum;
  'description'?: MAXNUMBEROFREFUNDSEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MAXNUMBEROFREFUNDSEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MAXNUMBEROFREFUNDSEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MAXNUMBEROFREFUNDSEXCEEDED.attributeTypeMap;
  }
}

export namespace MAXNUMBEROFREFUNDSEXCEEDED {
  export enum IssueEnum {
    MaxNumberOfRefundsExceeded = <any>'MAX_NUMBER_OF_REFUNDS_EXCEEDED',
  }
  export enum DescriptionEnum {
    YouHaveExceededTheMaximumNumberOfRefundAttemptsForThisCapture = <any>(
      'You have exceeded the maximum number of refund attempts for this capture.'
    ),
  }
}
