export class Model422IssuesInner {
  'issue'?: Model422IssuesInner.IssueEnum;
  'description'?: Model422IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model422IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model422IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model422IssuesInner.attributeTypeMap;
  }
}

export namespace Model422IssuesInner {
  export enum IssueEnum {
    PayeeAccountRestricted = <any>'PAYEE_ACCOUNT_RESTRICTED',
  }
  export enum DescriptionEnum {
    PayeeAccountIsRestricted = <any>'Payee account is restricted.',
  }
}
