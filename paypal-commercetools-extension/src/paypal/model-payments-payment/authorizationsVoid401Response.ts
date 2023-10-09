import { Model401IssuesInner } from './model401IssuesInner';

export class AuthorizationsVoid401Response {
  'name'?: AuthorizationsVoid401Response.NameEnum;
  'message'?: AuthorizationsVoid401Response.MessageEnum;
  'issues'?: Array<Model401IssuesInner>;
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
      type: 'AuthorizationsVoid401Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsVoid401Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model401IssuesInner>',
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
    return AuthorizationsVoid401Response.attributeTypeMap;
  }
}

export namespace AuthorizationsVoid401Response {
  export enum NameEnum {
    AuthenticationFailure = <any>'AUTHENTICATION_FAILURE',
  }
  export enum MessageEnum {
    AuthenticationFailedDueToMissingAuthorizationHeaderOrInvalidAuthenticationCredentials = <
      any
    >'Authentication failed due to missing authorization header, or invalid authentication credentials.',
  }
}
