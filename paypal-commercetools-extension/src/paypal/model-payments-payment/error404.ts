import { ErrorDetails } from './errorDetails';

/**
 * Error response for 404
 */
export class Error404 {
  'name'?: Error404.NameEnum;
  'message'?: Error404.MessageEnum;
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
      type: 'Error404.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'Error404.MessageEnum',
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
    return Error404.attributeTypeMap;
  }
}

export namespace Error404 {
  export enum NameEnum {
    ResourceNotFound = <any>'RESOURCE_NOT_FOUND',
  }
  export enum MessageEnum {
    TheSpecifiedResourceDoesNotExist = <any>(
      'The specified resource does not exist.'
    ),
  }
}
