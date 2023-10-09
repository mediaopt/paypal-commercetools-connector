/**
 * The details of the authorized payment status.
 */
export class AuthorizationStatusDetails {
  /**
   * The reason why the authorized status is `PENDING`.
   */
  'reason'?: AuthorizationStatusDetails.ReasonEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'reason',
      baseName: 'reason',
      type: 'AuthorizationStatusDetails.ReasonEnum',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationStatusDetails.attributeTypeMap;
  }
}

export namespace AuthorizationStatusDetails {
  export enum ReasonEnum {
    PendingReview = <any>'PENDING_REVIEW',
  }
}
