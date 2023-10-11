import { Model404IssuesInner } from './model404IssuesInner';

export class AuthorizationsGet404Response {
  'name'?: AuthorizationsGet404Response.NameEnum;
  'message'?: AuthorizationsGet404Response.MessageEnum;
  'issues'?: Array<Model404IssuesInner>;
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
      type: 'AuthorizationsGet404Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsGet404Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model404IssuesInner>',
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
    return AuthorizationsGet404Response.attributeTypeMap;
  }
}

export namespace AuthorizationsGet404Response {
  export enum NameEnum {
    ResourceNotFound = <any>'RESOURCE_NOT_FOUND',
  }
  export enum MessageEnum {
    TheSpecifiedResourceDoesNotExist = <any>(
      'The specified resource does not exist.'
    ),
  }
}
