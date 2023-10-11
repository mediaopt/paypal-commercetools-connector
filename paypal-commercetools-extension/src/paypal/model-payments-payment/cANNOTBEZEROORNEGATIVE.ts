export class CANNOTBEZEROORNEGATIVE {
  'issue'?: CANNOTBEZEROORNEGATIVE.IssueEnum;
  'description'?: CANNOTBEZEROORNEGATIVE.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'CANNOTBEZEROORNEGATIVE.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'CANNOTBEZEROORNEGATIVE.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CANNOTBEZEROORNEGATIVE.attributeTypeMap;
  }
}

export namespace CANNOTBEZEROORNEGATIVE {
  export enum IssueEnum {
    CannotBeZeroOrNegative = <any>'CANNOT_BE_ZERO_OR_NEGATIVE',
  }
  export enum DescriptionEnum {
    MustBeGreaterThanZeroIfTheCurrencySupportsDecimalsOnlyTwoDecimalPlacePrecisionIsSupported = <
      any
    >'Must be greater than zero. If the currency supports decimals, only two decimal place precision is supported.',
  }
}
