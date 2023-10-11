export class REFUNDNOTPERMITTEDDUETOCHARGEBACK {
  'issue'?: REFUNDNOTPERMITTEDDUETOCHARGEBACK.IssueEnum;
  'description'?: REFUNDNOTPERMITTEDDUETOCHARGEBACK.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REFUNDNOTPERMITTEDDUETOCHARGEBACK.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REFUNDNOTPERMITTEDDUETOCHARGEBACK.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REFUNDNOTPERMITTEDDUETOCHARGEBACK.attributeTypeMap;
  }
}

export namespace REFUNDNOTPERMITTEDDUETOCHARGEBACK {
  export enum IssueEnum {
    RefundNotPermittedDueToChargeback = <any>(
      'REFUND_NOT_PERMITTED_DUE_TO_CHARGEBACK'
    ),
  }
  export enum DescriptionEnum {
    RefundsAreNotAllowedOnThisCaptureDueToAChargebackOnTheCardOrBankPleaseContactThePayeeToResolveTheChargeback = <
      any
    >'Refunds are not allowed on this capture due to a chargeback on the card or bank. Please contact the payee to resolve the chargeback.',
  }
}
