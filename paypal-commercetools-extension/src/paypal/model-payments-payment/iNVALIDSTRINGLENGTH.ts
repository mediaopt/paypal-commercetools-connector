export class INVALIDSTRINGLENGTH {
  'issue'?: INVALIDSTRINGLENGTH.IssueEnum;
  'description'?: INVALIDSTRINGLENGTH.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'INVALIDSTRINGLENGTH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'INVALIDSTRINGLENGTH.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return INVALIDSTRINGLENGTH.attributeTypeMap;
  }
}

export namespace INVALIDSTRINGLENGTH {
  export enum IssueEnum {
    InvalidStringLength = <any>'INVALID_STRING_LENGTH',
  }
  export enum DescriptionEnum {
    TheValueOfAFieldIsEitherTooShortOrTooLong = <any>(
      'The value of a field is either too short or too long.'
    ),
  }
}
