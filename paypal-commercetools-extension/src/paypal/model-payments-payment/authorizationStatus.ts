import { AuthorizationStatusDetails } from './authorizationStatusDetails';

/**
 * The status fields for an authorized payment.
 */
export class AuthorizationStatus {
  /**
   * The status for the authorized payment.
   */
  'status'?: AuthorizationStatus.StatusEnum;
  'statusDetails'?: AuthorizationStatusDetails;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'status',
      baseName: 'status',
      type: 'AuthorizationStatus.StatusEnum',
    },
    {
      name: 'statusDetails',
      baseName: 'status_details',
      type: 'AuthorizationStatusDetails',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationStatus.attributeTypeMap;
  }
}

export namespace AuthorizationStatus {
  export enum StatusEnum {
    Created = <any>'CREATED',
    Captured = <any>'CAPTURED',
    Denied = <any>'DENIED',
    PartiallyCaptured = <any>'PARTIALLY_CAPTURED',
    Voided = <any>'VOIDED',
    Pending = <any>'PENDING',
  }
}
