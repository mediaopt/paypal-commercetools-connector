import { ErrorDetails } from './errorDetails';

/**
 * Error response for 401
 */
export class Error401 {
  'name'?: Error401.NameEnum;
  'message'?: Error401.MessageEnum;
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
      type: 'Error401.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error401.MessageEnum',
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
    return Error401.attributeTypeMap;
  }
}

export namespace Error401 {
  export enum NameEnum {
    AuthenticationFailure = <any>'AUTHENTICATION_FAILURE',
  }
  export enum MessageEnum {
    AuthenticationFailedDueToMissingAuthorizationHeaderOrInvalidAuthenticationCredentials = <
      any
    >'Authentication failed due to missing authorization header, or invalid authentication credentials.',
  }
}
