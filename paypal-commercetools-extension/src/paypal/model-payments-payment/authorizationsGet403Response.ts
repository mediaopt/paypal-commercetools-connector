import { Model403IssuesInner } from './model403IssuesInner';

export class AuthorizationsGet403Response {
  'name'?: AuthorizationsGet403Response.NameEnum;
  'message'?: AuthorizationsGet403Response.MessageEnum;
  'issues'?: Array<Model403IssuesInner>;
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
      type: 'AuthorizationsGet403Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsGet403Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model403IssuesInner>',
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
    return AuthorizationsGet403Response.attributeTypeMap;
  }
}

export namespace AuthorizationsGet403Response {
  export enum NameEnum {
    NotAuthorized = <any>'NOT_AUTHORIZED',
  }
  export enum MessageEnum {
    AuthorizationFailedDueToInsufficientPermissions = <any>(
      'Authorization failed due to insufficient permissions.'
    ),
  }
}
