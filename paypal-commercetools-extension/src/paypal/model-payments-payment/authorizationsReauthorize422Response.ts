import { AuthorizationsReauthorize422IssuesInner } from './authorizationsReauthorize422IssuesInner';

export class AuthorizationsReauthorize422Response {
  'name'?: AuthorizationsReauthorize422Response.NameEnum;
  'message'?: AuthorizationsReauthorize422Response.MessageEnum;
  'issues'?: Array<AuthorizationsReauthorize422IssuesInner>;
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
      type: 'AuthorizationsReauthorize422Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsReauthorize422Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsReauthorize422IssuesInner>',
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
    return AuthorizationsReauthorize422Response.attributeTypeMap;
  }
}

export namespace AuthorizationsReauthorize422Response {
  export enum NameEnum {
    UnprocessableEntity = <any>'UNPROCESSABLE_ENTITY',
  }
  export enum MessageEnum {
    TheRequestedActionCouldNotBePerformedSemanticallyIncorrectOrFailedBusinessValidation = <
      any
    >'The requested action could not be performed, semantically incorrect, or failed business validation.',
  }
}
