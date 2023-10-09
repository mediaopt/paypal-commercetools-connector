import { CapturesRefund422IssuesInner } from './capturesRefund422IssuesInner';

export class CapturesRefund422Response {
  'name'?: CapturesRefund422Response.NameEnum;
  'message'?: CapturesRefund422Response.MessageEnum;
  'issues'?: Array<CapturesRefund422IssuesInner>;
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
      type: 'CapturesRefund422Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'CapturesRefund422Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<CapturesRefund422IssuesInner>',
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
    return CapturesRefund422Response.attributeTypeMap;
  }
}

export namespace CapturesRefund422Response {
  export enum NameEnum {
    UnprocessableEntity = <any>'UNPROCESSABLE_ENTITY',
  }
  export enum MessageEnum {
    TheRequestedActionCouldNotBePerformedSemanticallyIncorrectOrFailedBusinessValidation = <
      any
    >'The requested action could not be performed, semantically incorrect, or failed business validation.',
  }
}
