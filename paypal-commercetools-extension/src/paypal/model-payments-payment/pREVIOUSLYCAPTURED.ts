export class PREVIOUSLYCAPTURED {
  'issue'?: PREVIOUSLYCAPTURED.IssueEnum;
  'description'?: PREVIOUSLYCAPTURED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PREVIOUSLYCAPTURED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PREVIOUSLYCAPTURED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PREVIOUSLYCAPTURED.attributeTypeMap;
  }
}

export namespace PREVIOUSLYCAPTURED {
  export enum IssueEnum {
    PreviouslyCaptured = <any>'PREVIOUSLY_CAPTURED',
  }
  export enum DescriptionEnum {
    AuthorizationHasBeenPreviouslyCapturedAndHenceCannotBeVoided = <any>(
      'Authorization has been previously captured and hence cannot be voided.'
    ),
  }
}
