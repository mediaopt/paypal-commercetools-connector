/**
 * Error response for 500
 */
export class Error500 {
  'name'?: Error500.NameEnum;
  'message'?: Error500.MessageEnum;
  /**
   * The PayPal internal ID. Used for correlation purposes.
   */
  'debugId'?: string;
  /**
   * The information link, or URI, that shows detailed information about this error for the developer.
   */
  'informationLink'?: Error500.InformationLinkEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'name',
      baseName: 'name',
      type: 'Error500.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error500.MessageEnum',
    },
    {
      name: 'debugId',
      baseName: 'debug_id',
      type: 'string',
    },
    {
      name: 'informationLink',
      baseName: 'information_link',
      type: 'Error500.InformationLinkEnum',
    },
  ];

  static getAttributeTypeMap() {
    return Error500.attributeTypeMap;
  }
}

export namespace Error500 {
  export enum NameEnum {
    InternalServerError = <any>'INTERNAL_SERVER_ERROR',
  }
  export enum MessageEnum {
    AnInternalServerErrorOccurred = <any>'An internal server error occurred.',
  }
  export enum InformationLinkEnum {
    HttpsDeveloperPaypalComApiOrdersV2ErrorInternalServerError = <any>(
      'https://developer.paypal.com/api/orders/v2/#error-INTERNAL_SERVER_ERROR'
    ),
  }
}
