export class PAYERACCOUNTLOCKEDORCLOSED {
  'issue'?: PAYERACCOUNTLOCKEDORCLOSED.IssueEnum;
  'description'?: PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PAYERACCOUNTLOCKEDORCLOSED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PAYERACCOUNTLOCKEDORCLOSED.attributeTypeMap;
  }
}

export namespace PAYERACCOUNTLOCKEDORCLOSED {
  export enum IssueEnum {
    PayerAccountLockedOrClosed = <any>'PAYER_ACCOUNT_LOCKED_OR_CLOSED',
  }
  export enum DescriptionEnum {
    ThePayerAccountCannotBeUsedForThisTransaction = <any>(
      'The payer account cannot be used for this transaction.'
    ),
  }
}
