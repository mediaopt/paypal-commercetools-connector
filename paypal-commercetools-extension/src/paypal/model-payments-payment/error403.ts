import { ErrorDetails } from './errorDetails';

/**
 * Error response for 403
 */
export class Error403 {
  'name'?: Error403.NameEnum;
  'message'?: Error403.MessageEnum;
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
      type: 'Error403.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error403.MessageEnum',
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
    return Error403.attributeTypeMap;
  }
}

export namespace Error403 {
  export enum NameEnum {
    NotAuthorized = <any>'NOT_AUTHORIZED',
  }
  export enum MessageEnum {
    AuthorizationFailedDueToInsufficientPermissions = <any>(
      'Authorization failed due to insufficient permissions.'
    ),
  }
}
