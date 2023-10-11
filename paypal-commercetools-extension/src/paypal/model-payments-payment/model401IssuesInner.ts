export class Model401IssuesInner {
  'issue'?: Model401IssuesInner.IssueEnum;
  'description'?: Model401IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model401IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model401IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model401IssuesInner.attributeTypeMap;
  }
}

export namespace Model401IssuesInner {
  export enum IssueEnum {
    InvalidAccountStatus = <any>'INVALID_ACCOUNT_STATUS',
  }
  export enum DescriptionEnum {
    AccountValidationsFailedForTheUser = <any>(
      'Account validations failed for the user.'
    ),
  }
}
