export class REFUNDCAPTURECURRENCYMISMATCH {
  'issue'?: REFUNDCAPTURECURRENCYMISMATCH.IssueEnum;
  'description'?: REFUNDCAPTURECURRENCYMISMATCH.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDCAPTURECURRENCYMISMATCH.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDCAPTURECURRENCYMISMATCH.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDCAPTURECURRENCYMISMATCH.attributeTypeMap;
  }
}

export namespace REFUNDCAPTURECURRENCYMISMATCH {
  export enum IssueEnum {
    RefundCaptureCurrencyMismatch = <any>'REFUND_CAPTURE_CURRENCY_MISMATCH',
  }
  export enum DescriptionEnum {
    RefundMustBeInTheSameCurrencyAsTheCapture = <any>(
      'Refund must be in the same currency as the capture'
    ),
  }
}
