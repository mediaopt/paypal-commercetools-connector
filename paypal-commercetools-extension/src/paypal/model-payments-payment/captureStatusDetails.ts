/**
 * The details of the captured payment status.
 */
export class CaptureStatusDetails {
  /**
   * The reason why the captured payment status is `PENDING` or `DENIED`.
   */
  'reason'?: CaptureStatusDetails.ReasonEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'reason',
      baseName: 'reason',
      type: 'CaptureStatusDetails.ReasonEnum',
    },
  ];

  static getAttributeTypeMap() {
    return CaptureStatusDetails.attributeTypeMap;
  }
}

export namespace CaptureStatusDetails {
  export enum ReasonEnum {
    BuyerComplaint = <any>'BUYER_COMPLAINT',
    Chargeback = <any>'CHARGEBACK',
    Echeck = <any>'ECHECK',
    InternationalWithdrawal = <any>'INTERNATIONAL_WITHDRAWAL',
    Other = <any>'OTHER',
    PendingReview = <any>'PENDING_REVIEW',
    ReceivingPreferenceMandatesManualAction = <any>(
      'RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION'
    ),
    Refunded = <any>'REFUNDED',
    TransactionApprovedAwaitingFunding = <any>(
      'TRANSACTION_APPROVED_AWAITING_FUNDING'
    ),
    Unilateral = <any>'UNILATERAL',
    VerificationRequired = <any>'VERIFICATION_REQUIRED',
  }
}
