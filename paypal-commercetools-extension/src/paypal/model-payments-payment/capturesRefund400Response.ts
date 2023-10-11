import { CapturesRefund400IssuesInner } from './capturesRefund400IssuesInner';

export class CapturesRefund400Response {
  'name'?: CapturesRefund400Response.NameEnum;
  'message'?: CapturesRefund400Response.MessageEnum;
  'issues'?: Array<CapturesRefund400IssuesInner>;
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
      type: 'CapturesRefund400Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'CapturesRefund400Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<CapturesRefund400IssuesInner>',
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
    return CapturesRefund400Response.attributeTypeMap;
  }
}

export namespace CapturesRefund400Response {
  export enum NameEnum {
    InvalidRequest = <any>'INVALID_REQUEST',
  }
  export enum MessageEnum {
    RequestIsNotWellFormedSyntacticallyIncorrectOrViolatesSchema = <any>(
      'Request is not well-formed, syntactically incorrect, or violates schema.'
    ),
  }
}
