export class DUPLICATEINVOICEID1 {
  'issue'?: DUPLICATEINVOICEID1.IssueEnum;
  'description'?: DUPLICATEINVOICEID1.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'DUPLICATEINVOICEID1.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'DUPLICATEINVOICEID1.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return DUPLICATEINVOICEID1.attributeTypeMap;
  }
}

export namespace DUPLICATEINVOICEID1 {
  export enum IssueEnum {
    DuplicateInvoiceId = <any>'DUPLICATE_INVOICE_ID',
  }
  export enum DescriptionEnum {
    InvoiceIdWasPreviouslyUsedToRefundACapture = <any>(
      'Invoice ID was previously used to refund a capture.'
    ),
  }
}
