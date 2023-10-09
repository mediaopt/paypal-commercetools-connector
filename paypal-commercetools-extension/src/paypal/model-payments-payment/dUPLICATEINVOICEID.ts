export class DUPLICATEINVOICEID {
  'issue'?: DUPLICATEINVOICEID.IssueEnum;
  'description'?: DUPLICATEINVOICEID.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'DUPLICATEINVOICEID.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'DUPLICATEINVOICEID.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return DUPLICATEINVOICEID.attributeTypeMap;
  }
}

export namespace DUPLICATEINVOICEID {
  export enum IssueEnum {
    DuplicateInvoiceId = <any>'DUPLICATE_INVOICE_ID',
  }
  export enum DescriptionEnum {
    RequestedInvoiceIdHasBeenPreviouslyCapturedPossibleDuplicateTransaction = <
      any
    >'Requested invoice_id has been previously captured. Possible duplicate transaction.',
  }
}
