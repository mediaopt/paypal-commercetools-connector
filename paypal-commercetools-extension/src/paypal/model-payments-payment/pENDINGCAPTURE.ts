export class PENDINGCAPTURE {
  'issue'?: PENDINGCAPTURE.IssueEnum;
  'description'?: PENDINGCAPTURE.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PENDINGCAPTURE.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PENDINGCAPTURE.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PENDINGCAPTURE.attributeTypeMap;
  }
}

export namespace PENDINGCAPTURE {
  export enum IssueEnum {
    PendingCapture = <any>'PENDING_CAPTURE',
  }
  export enum DescriptionEnum {
    CannotInitiateARefundAsTheCaptureIsPendingCaptureIsTypicallyPendingWhenThePayerHasFundedTheTransactionUsingECheckBankFunded = <
      any
    >'Cannot initiate a refund as the capture is pending. Capture is typically pending when the payer has funded the transaction using e-check/bank funded.',
  }
}
