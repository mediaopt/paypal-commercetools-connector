/**
 * The date and time stamps that are common to authorized payment, captured payment, and refund transactions.
 */
export class ActivityTimestamps {
  /**
   * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Seconds are required while fractional seconds are optional.<blockquote><strong>Note:</strong> The regular expression provides guidance but does not reject all invalid dates.</blockquote>
   */
  'createTime'?: string;
  /**
   * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Seconds are required while fractional seconds are optional.<blockquote><strong>Note:</strong> The regular expression provides guidance but does not reject all invalid dates.</blockquote>
   */
  'updateTime'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'createTime',
      baseName: 'create_time',
      type: 'string',
    },
    {
      name: 'updateTime',
      baseName: 'update_time',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return ActivityTimestamps.attributeTypeMap;
  }
}
