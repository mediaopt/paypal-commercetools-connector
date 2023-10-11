export class REAUTHORIZATIONNOTSUPPORTED {
  'issue'?: REAUTHORIZATIONNOTSUPPORTED.IssueEnum;
  'description'?: REAUTHORIZATIONNOTSUPPORTED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'REAUTHORIZATIONNOTSUPPORTED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'REAUTHORIZATIONNOTSUPPORTED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return REAUTHORIZATIONNOTSUPPORTED.attributeTypeMap;
  }
}

export namespace REAUTHORIZATIONNOTSUPPORTED {
  export enum IssueEnum {
    ReauthorizationNotSupported = <any>'REAUTHORIZATION_NOT_SUPPORTED',
  }
  export enum DescriptionEnum {
    AReauthorizeCannotBeAttemptedOnAnAuthorizationIdThatIsTheResultOfAPriorReauthorizationOrOnAnAuthorizationMadeOnAnOrderSavedUsingTheV2OrdersIdSaveApi = <
      any
    >'A reauthorize cannot be attempted on an authorization_id that is the result of a prior reauthorization or on an authorization made on an Order saved using the `v2/orders/id/save` API.',
  }
}
