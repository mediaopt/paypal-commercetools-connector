import { ErrorDetails } from './errorDetails';

/**
 * The default error response.
 */
export class ErrorDefault {
  'name'?: ErrorDefault.NameEnum;
  'message'?: ErrorDefault.MessageEnum;
  'issues'?: Array<ErrorDetails>;
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
      type: 'ErrorDefault.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'ErrorDefault.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<ErrorDetails>',
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
    return ErrorDefault.attributeTypeMap;
  }
}

export namespace ErrorDefault {
  export enum NameEnum {
    ServiceUnavailable = <any>'SERVICE_UNAVAILABLE',
  }
  export enum MessageEnum {
    ServiceUnavailable = <any>'Service Unavailable.',
  }
}
