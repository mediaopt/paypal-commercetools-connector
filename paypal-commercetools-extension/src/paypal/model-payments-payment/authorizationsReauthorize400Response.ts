import { AuthorizationsReauthorize400IssuesInner } from './authorizationsReauthorize400IssuesInner';

export class AuthorizationsReauthorize400Response {
  'name'?: AuthorizationsReauthorize400Response.NameEnum;
  'message'?: AuthorizationsReauthorize400Response.MessageEnum;
  'issues'?: Array<AuthorizationsReauthorize400IssuesInner>;
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
      type: 'AuthorizationsReauthorize400Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsReauthorize400Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsReauthorize400IssuesInner>',
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
    return AuthorizationsReauthorize400Response.attributeTypeMap;
  }
}

export namespace AuthorizationsReauthorize400Response {
  export enum NameEnum {
    InvalidRequest = <any>'INVALID_REQUEST',
  }
  export enum MessageEnum {
    RequestIsNotWellFormedSyntacticallyIncorrectOrViolatesSchema = <any>(
      'Request is not well-formed, syntactically incorrect, or violates schema.'
    ),
  }
}
