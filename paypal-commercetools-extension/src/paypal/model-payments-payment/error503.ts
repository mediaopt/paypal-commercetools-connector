/**
 * Error response for 503
 */
export class Error503 {
  'name'?: Error503.NameEnum;
  'message'?: Error503.MessageEnum;
  /**
   * The PayPal internal ID. Used for correlation purposes.
   */
  'debugId'?: string;
  /**
   * The information link, or URI, that shows detailed information about this error for the developer.
   */
  'informationLink'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'name',
      baseName: 'name',
      type: 'Error503.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error503.MessageEnum',
    },
    {
      name: 'debugId',
      baseName: 'debug_id',
      type: 'string',
    },
    {
      name: 'informationLink',
      baseName: 'information_link',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return Error503.attributeTypeMap;
  }
}

export namespace Error503 {
  export enum NameEnum {
    ServiceUnavailable = <any>'SERVICE_UNAVAILABLE',
  }
  export enum MessageEnum {
    ServiceUnavailable = <any>'Service Unavailable.',
  }
}
