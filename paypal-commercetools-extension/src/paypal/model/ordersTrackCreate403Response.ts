/**
 * Orders
 * An order represents a payment between two or more parties. Use the Orders API to create, update, retrieve, authorize, and capture orders.
 *
 * The version of the OpenAPI document: 2.13
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { OrdersTrackCreate403IssuesInner } from './ordersTrackCreate403IssuesInner';

export class OrdersTrackCreate403Response {
  'name'?: OrdersTrackCreate403Response.NameEnum;
  'message'?: OrdersTrackCreate403Response.MessageEnum;
  'issues'?: Array<OrdersTrackCreate403IssuesInner>;
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
      type: 'OrdersTrackCreate403Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'OrdersTrackCreate403Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<OrdersTrackCreate403IssuesInner>',
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
    return OrdersTrackCreate403Response.attributeTypeMap;
  }
}

export namespace OrdersTrackCreate403Response {
  export enum NameEnum {
    NotAuthorized = <any>'NOT_AUTHORIZED',
  }
  export enum MessageEnum {
    AuthorizationFailedDueToInsufficientPermissions = <any>(
      'Authorization failed due to insufficient permissions.'
    ),
  }
}
