export class DECIMALPRECISION {
  'issue'?: DECIMALPRECISION.IssueEnum;
  'description'?: DECIMALPRECISION.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'DECIMALPRECISION.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'DECIMALPRECISION.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return DECIMALPRECISION.attributeTypeMap;
  }
}

export namespace DECIMALPRECISION {
  export enum IssueEnum {
    DecimalPrecision = <any>'DECIMAL_PRECISION',
  }
  export enum DescriptionEnum {
    IfTheCurrencySupportsDecimalsOnlyTwoDecimalPlacePrecisionIsSupported = <
      any
    >'If the currency supports decimals, only two decimal place precision is supported.',
  }
}
