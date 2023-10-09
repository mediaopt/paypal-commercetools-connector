import { Model409IssuesInner } from './model409IssuesInner';

export class AuthorizationsVoid409Response {
  'name'?: AuthorizationsVoid409Response.NameEnum;
  'message'?: AuthorizationsVoid409Response.MessageEnum;
  'issues'?: Array<Model409IssuesInner>;
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
      type: 'AuthorizationsVoid409Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'AuthorizationsVoid409Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model409IssuesInner>',
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
    return AuthorizationsVoid409Response.attributeTypeMap;
  }
}

export namespace AuthorizationsVoid409Response {
  export enum NameEnum {
    ResourceConflict = <any>'RESOURCE_CONFLICT',
  }
  export enum MessageEnum {
    TheServerHasDetectedAConflictWhileProcessingThisRequest = <any>(
      'The server has detected a conflict while processing this request.'
    ),
  }
}
