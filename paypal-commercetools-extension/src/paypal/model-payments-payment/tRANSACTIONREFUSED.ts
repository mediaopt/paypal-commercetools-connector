export class TRANSACTIONREFUSED {
  'issue'?: TRANSACTIONREFUSED.IssueEnum;
  'description'?: TRANSACTIONREFUSED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'TRANSACTIONREFUSED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'TRANSACTIONREFUSED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return TRANSACTIONREFUSED.attributeTypeMap;
  }
}

export namespace TRANSACTIONREFUSED {
  export enum IssueEnum {
    TransactionRefused = <any>'TRANSACTION_REFUSED',
  }
  export enum DescriptionEnum {
    PayPalsInternalControlsPreventAuthorizationFromBeingCaptured = <any>(
      "PayPal's internal controls prevent authorization from being captured."
    ),
  }
}
