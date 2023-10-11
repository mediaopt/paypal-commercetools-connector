export class TRANSACTIONDISPUTED {
  'issue'?: TRANSACTIONDISPUTED.IssueEnum;
  'description'?: TRANSACTIONDISPUTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'TRANSACTIONDISPUTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'TRANSACTIONDISPUTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return TRANSACTIONDISPUTED.attributeTypeMap;
  }
}

export namespace TRANSACTIONDISPUTED {
  export enum IssueEnum {
    TransactionDisputed = <any>'TRANSACTION_DISPUTED',
  }
  export enum DescriptionEnum {
    PartialRefundsCannotBeOfferedAtThisTimeBecauseThereIsAnOpenCaseOnThisTransactionVisitThePayPalResolutionCenterToReviewThisCase = <
      any
    >'Partial refunds cannot be offered at this time because there is an open case on this transaction. Visit the PayPal Resolution Center to review this case.',
  }
}
