export class MAXCAPTUREAMOUNTEXCEEDED {
  'issue'?: MAXCAPTUREAMOUNTEXCEEDED.IssueEnum;
  'description'?: MAXCAPTUREAMOUNTEXCEEDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MAXCAPTUREAMOUNTEXCEEDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MAXCAPTUREAMOUNTEXCEEDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MAXCAPTUREAMOUNTEXCEEDED.attributeTypeMap;
  }
}

export namespace MAXCAPTUREAMOUNTEXCEEDED {
  export enum IssueEnum {
    MaxCaptureAmountExceeded = <any>'MAX_CAPTURE_AMOUNT_EXCEEDED',
  }
  export enum DescriptionEnum {
    CaptureAmountExceedsAllowableLimitPleaseContactCustomerServiceOrYourAccountManagerToRequestTheChangeToYourOverageLimitTheDefaultOverageLimitIs115WhichAllowsTheSumOfAllCapturesToBeUpTo115OfTheOrderAmountTheAbilityToOverCaptureIsSubjectedToRegulatoryApprovals = <
      any
    >'Capture amount exceeds allowable limit. Please contact customer service or your account manager to request the change to your overage limit. The default overage limit is 115%, which allows the sum of all captures to be up to 115% of the order amount. The ability to over capture is subjected to regulatory approvals.',
  }
}
