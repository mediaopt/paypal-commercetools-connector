import { RefundStatusDetails } from './refundStatusDetails';

/**
 * The refund status.
 */
export class RefundStatus {
  /**
   * The status of the refund.
   */
  'status'?: RefundStatus.StatusEnum;
  'statusDetails'?: RefundStatusDetails;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'status',
      baseName: 'status',
      type: 'RefundStatus.StatusEnum',
    },
    {
      name: 'statusDetails',
      baseName: 'status_details',
      type: 'RefundStatusDetails',
    },
  ];

  static getAttributeTypeMap() {
    return RefundStatus.attributeTypeMap;
  }
}

export namespace RefundStatus {
  export enum StatusEnum {
    Cancelled = <any>'CANCELLED',
    Failed = <any>'FAILED',
    Pending = <any>'PENDING',
    Completed = <any>'COMPLETED',
  }
}
