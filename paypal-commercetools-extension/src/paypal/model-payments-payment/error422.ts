import { ErrorDetails } from './errorDetails';

/**
 * Error response for 422
 */
export class Error422 {
  'name'?: Error422.NameEnum;
  'message'?: Error422.MessageEnum;
  'issues'?: Array<ErrorDetails>;
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
      type: 'Error422.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error422.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<ErrorDetails>',
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
    return Error422.attributeTypeMap;
  }
}

export namespace Error422 {
  export enum NameEnum {
    UnprocessableEntity = <any>'UNPROCESSABLE_ENTITY',
  }
  export enum MessageEnum {
    TheRequestedActionCouldNotBePerformedSemanticallyIncorrectOrFailedBusinessValidation = <
      any
    >'The requested action could not be performed, semantically incorrect, or failed business validation.',
  }
}
