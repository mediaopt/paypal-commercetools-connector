export class PREVIOUSLYVOIDED {
  'issue'?: PREVIOUSLYVOIDED.IssueEnum;
  'description'?: PREVIOUSLYVOIDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PREVIOUSLYVOIDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PREVIOUSLYVOIDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PREVIOUSLYVOIDED.attributeTypeMap;
  }
}

export namespace PREVIOUSLYVOIDED {
  export enum IssueEnum {
    PreviouslyVoided = <any>'PREVIOUSLY_VOIDED',
  }
  export enum DescriptionEnum {
    AuthorizationHasBeenPreviouslyVoidedAndHenceCannotBeVoidedAgain = <any>(
      'Authorization has been previously voided and hence cannot be voided again.'
    ),
  }
}
