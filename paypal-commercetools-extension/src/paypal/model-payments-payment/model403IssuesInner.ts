export class Model403IssuesInner {
  'issue'?: Model403IssuesInner.IssueEnum;
  'description'?: Model403IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model403IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model403IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model403IssuesInner.attributeTypeMap;
  }
}

export namespace Model403IssuesInner {
  export enum IssueEnum {
    PermissionDenied = <any>'PERMISSION_DENIED',
  }
  export enum DescriptionEnum {
    YouDoNotHavePermissionToAccessOrPerformOperationsOnThisResource = <any>(
      'You do not have permission to access or perform operations on this resource.'
    ),
  }
}
