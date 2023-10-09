import { Model422IssuesInner } from './model422IssuesInner';

export class AuthorizationsCapture422Response {
  'name'?: AuthorizationsCapture422Response.NameEnum;
  'message'?: AuthorizationsCapture422Response.MessageEnum;
  'issues'?: Array<Model422IssuesInner>;
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
      type: 'AuthorizationsCapture422Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsCapture422Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model422IssuesInner>',
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
    return AuthorizationsCapture422Response.attributeTypeMap;
  }
}

export namespace AuthorizationsCapture422Response {
  export enum NameEnum {
    UnprocessableEntity = <any>'UNPROCESSABLE_ENTITY',
  }
  export enum MessageEnum {
    TheRequestedActionCouldNotBePerformedSemanticallyIncorrectOrFailedBusinessValidation = <
      any
    >'The requested action could not be performed, semantically incorrect, or failed business validation.',
  }
}
