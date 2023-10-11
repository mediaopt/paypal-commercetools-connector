export class INVALIDACCOUNTSTATUS {
  'issue'?: INVALIDACCOUNTSTATUS.IssueEnum;
  'description'?: INVALIDACCOUNTSTATUS.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'INVALIDACCOUNTSTATUS.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'INVALIDACCOUNTSTATUS.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDACCOUNTSTATUS.attributeTypeMap;
  }
}

export namespace INVALIDACCOUNTSTATUS {
  export enum IssueEnum {
    InvalidAccountStatus = <any>'INVALID_ACCOUNT_STATUS',
  }
  export enum DescriptionEnum {
    AccountValidationsFailedForTheUser = <any>(
      'Account validations failed for the user.'
    ),
  }
}
