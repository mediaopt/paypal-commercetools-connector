import { Model400IssuesInner } from './model400IssuesInner';

export class AuthorizationsCapture400Response {
  'name'?: AuthorizationsCapture400Response.NameEnum;
  'message'?: AuthorizationsCapture400Response.MessageEnum;
  'issues'?: Array<Model400IssuesInner>;
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
      type: 'AuthorizationsCapture400Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsCapture400Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model400IssuesInner>',
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
    return AuthorizationsCapture400Response.attributeTypeMap;
  }
}

export namespace AuthorizationsCapture400Response {
  export enum NameEnum {
    InvalidRequest = <any>'INVALID_REQUEST',
  }
  export enum MessageEnum {
    RequestIsNotWellFormedSyntacticallyIncorrectOrViolatesSchema = <any>(
      'Request is not well-formed, syntactically incorrect, or violates schema.'
    ),
  }
}
