/**
 * The error details. Required for client-side `4XX` errors.
 */
export class ErrorDetails {
  /**
   * The field that caused the error. If this field is in the body, set this value to the field\'s JSON pointer value. Required for client-side errors.
   */
  'field'?: string;
  /**
   * The value of the field that caused the error.
   */
  'value'?: string;
  /**
   * The location of the field that caused the error. Value is `body`, `path`, or `query`.
   */
  'location'?: string = 'body';
  /**
   * The unique, fine-grained application-level error code.
   */
  'issue': string;
  /**
   * The human-readable description for an issue. The description can change over the lifetime of an API, so clients must not depend on this value.
   */
  'description'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'field',
      baseName: 'field',
      type: 'string',
    },
    {
      name: 'value',
      baseName: 'value',
      type: 'string',
    },
    {
      name: 'location',
      baseName: 'location',
      type: 'string',
    },
    {
      name: 'issue',
      baseName: 'issue',
      type: 'string',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return ErrorDetails.attributeTypeMap;
  }
}
