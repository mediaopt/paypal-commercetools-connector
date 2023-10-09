import { ErrorDetails } from './errorDetails';

/**
 * Error response for 409
 */
export class Error409 {
  'name'?: Error409.NameEnum;
  'message'?: Error409.MessageEnum;
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
      type: 'Error409.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error409.MessageEnum',
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
    return Error409.attributeTypeMap;
  }
}

export namespace Error409 {
  export enum NameEnum {
    ResourceConflict = <any>'RESOURCE_CONFLICT',
  }
  export enum MessageEnum {
    TheServerHasDetectedAConflictWhileProcessingThisRequest = <any>(
      'The server has detected a conflict while processing this request.'
    ),
  }
}