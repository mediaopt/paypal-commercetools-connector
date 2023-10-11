export class PERMISSIONDENIED {
  'issue'?: PERMISSIONDENIED.IssueEnum;
  'description'?: PERMISSIONDENIED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PERMISSIONDENIED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PERMISSIONDENIED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PERMISSIONDENIED.attributeTypeMap;
  }
}

export namespace PERMISSIONDENIED {
  export enum IssueEnum {
    PermissionDenied = <any>'PERMISSION_DENIED',
  }
  export enum DescriptionEnum {
    YouDoNotHavePermissionToAccessOrPerformOperationsOnThisResource = <any>(
      'You do not have permission to access or perform operations on this resource.'
    ),
  }
}
