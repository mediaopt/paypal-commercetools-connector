import { CaptureStatusDetails } from './captureStatusDetails';

/**
 * The status of a captured payment.
 */
export class CaptureStatus {
  /**
   * The status of the captured payment.
   */
  'status'?: CaptureStatus.StatusEnum;
  'statusDetails'?: CaptureStatusDetails;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'status',
      baseName: 'status',
      type: 'CaptureStatus.StatusEnum',
    },
    {
      name: 'statusDetails',
      baseName: 'status_details',
      type: 'CaptureStatusDetails',
    },
  ];

  static getAttributeTypeMap() {
    return CaptureStatus.attributeTypeMap;
  }
}

export namespace CaptureStatus {
  export enum StatusEnum {
    Completed = <any>'COMPLETED',
    Declined = <any>'DECLINED',
    PartiallyRefunded = <any>'PARTIALLY_REFUNDED',
    Pending = <any>'PENDING',
    Refunded = <any>'REFUNDED',
    Failed = <any>'FAILED',
  }
}
