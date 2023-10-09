/**
 * Identifiers related to a specific resource.
 */
export class RelatedIds {
  /**
   * Order ID related to the resource.
   */
  'orderId'?: string;
  /**
   * Authorization ID related to the resource.
   */
  'authorizationId'?: string;
  /**
   * Capture ID related to the resource.
   */
  'captureId'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'orderId',
      baseName: 'order_id',
      type: 'string',
    },
    {
      name: 'authorizationId',
      baseName: 'authorization_id',
      type: 'string',
    },
    {
      name: 'captureId',
      baseName: 'capture_id',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return RelatedIds.attributeTypeMap;
  }
}
