import { AuthorizationsVoid422IssuesInner } from './authorizationsVoid422IssuesInner';

export class AuthorizationsVoid422Response {
  'name'?: AuthorizationsVoid422Response.NameEnum;
  'message'?: AuthorizationsVoid422Response.MessageEnum;
  'issues'?: Array<AuthorizationsVoid422IssuesInner>;
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
      type: 'AuthorizationsVoid422Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsVoid422Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsVoid422IssuesInner>',
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
    return AuthorizationsVoid422Response.attributeTypeMap;
  }
}

export namespace AuthorizationsVoid422Response {
  export enum NameEnum {
    UnprocessableEntity = <any>'UNPROCESSABLE_ENTITY',
  }
  export enum MessageEnum {
    TheRequestedActionCouldNotBePerformedSemanticallyIncorrectOrFailedBusinessValidation = <
      any
    >'The requested action could not be performed, semantically incorrect, or failed business validation.',
  }
}
