export class Model404IssuesInner {
  'issue'?: Model404IssuesInner.IssueEnum;
  'description'?: Model404IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'Model404IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'Model404IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Model404IssuesInner.attributeTypeMap;
  }
}

export namespace Model404IssuesInner {
  export enum IssueEnum {
    InvalidResourceId = <any>'INVALID_RESOURCE_ID',
  }
  export enum DescriptionEnum {
    SpecifiedResourceIdDoesNotExistPleaseCheckTheResourceIdAndTryAgain = <any>(
      'Specified resource ID does not exist. Please check the resource ID and try again.'
    ),
  }
}
