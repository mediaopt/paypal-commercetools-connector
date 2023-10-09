export class PAYEEACCOUNTLOCKEDORCLOSED {
  'issue'?: PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum;
  'description'?: PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PAYEEACCOUNTLOCKEDORCLOSED.attributeTypeMap;
  }
}

export namespace PAYEEACCOUNTLOCKEDORCLOSED {
  export enum IssueEnum {
    PayeeAccountLockedOrClosed = <any>'PAYEE_ACCOUNT_LOCKED_OR_CLOSED',
  }
  export enum DescriptionEnum {
    TransactionCouldNotCompleteBecausePayeeAccountIsLockedOrClosed = <any>(
      'Transaction could not complete because payee account is locked or closed.'
    ),
  }
}
