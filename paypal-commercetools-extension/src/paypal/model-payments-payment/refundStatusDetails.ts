/**
 * The details of the refund status.
 */
export class RefundStatusDetails {
  /**
   * The reason why the refund has the `PENDING` or `FAILED` status.
   */
  'reason'?: RefundStatusDetails.ReasonEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'reason',
      baseName: 'reason',
      type: 'RefundStatusDetails.ReasonEnum',
    },
  ];

  static getAttributeTypeMap() {
    return RefundStatusDetails.attributeTypeMap;
  }
}

export namespace RefundStatusDetails {
  export enum ReasonEnum {
    Echeck = <any>'ECHECK',
  }
}
