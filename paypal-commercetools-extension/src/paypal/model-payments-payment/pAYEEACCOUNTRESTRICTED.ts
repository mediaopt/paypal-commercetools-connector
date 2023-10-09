export class PAYEEACCOUNTRESTRICTED {
  'issue'?: PAYEEACCOUNTRESTRICTED.IssueEnum;
  'description'?: PAYEEACCOUNTRESTRICTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PAYEEACCOUNTRESTRICTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PAYEEACCOUNTRESTRICTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PAYEEACCOUNTRESTRICTED.attributeTypeMap;
  }
}

export namespace PAYEEACCOUNTRESTRICTED {
  export enum IssueEnum {
    PayeeAccountRestricted = <any>'PAYEE_ACCOUNT_RESTRICTED',
  }
  export enum DescriptionEnum {
    PayeeAccountIsRestricted = <any>'Payee account is restricted.',
  }
}
