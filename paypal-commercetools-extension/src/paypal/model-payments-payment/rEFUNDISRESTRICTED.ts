export class REFUNDISRESTRICTED {
  'issue'?: REFUNDISRESTRICTED.IssueEnum;
  'description'?: REFUNDISRESTRICTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDISRESTRICTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDISRESTRICTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDISRESTRICTED.attributeTypeMap;
  }
}

export namespace REFUNDISRESTRICTED {
  export enum IssueEnum {
    RefundIsRestricted = <any>'REFUND_IS_RESTRICTED',
  }
  export enum DescriptionEnum {
    ThisRefundCanOnlyBeProcessedByTheApiCallerThatHadCapturedTheTransactionIfYouFacilitateYourTransactionsViaAPlatformPartnerPleaseInitiateARefundThroughThem = <
      any
    >"This refund can only be processed by the API caller that had 'captured' the transaction. If you facilitate your transactions via a platform/partner, please initiate a refund through them.",
  }
}
