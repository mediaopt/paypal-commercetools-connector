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

import { OrdersTrackersPatch400IssuesInner } from './ordersTrackersPatch400IssuesInner';

export class OrdersTrackersPatch400Response {
  'name'?: OrdersTrackersPatch400Response.NameEnum;
  'message'?: OrdersTrackersPatch400Response.MessageEnum;
  'issues'?: Array<OrdersTrackersPatch400IssuesInner>;
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
      type: 'OrdersTrackersPatch400Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'OrdersTrackersPatch400Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<OrdersTrackersPatch400IssuesInner>',
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
    return OrdersTrackersPatch400Response.attributeTypeMap;
  }
}

export namespace OrdersTrackersPatch400Response {
  export enum NameEnum {
    InvalidRequest = <any>'INVALID_REQUEST',
  }
  export enum MessageEnum {
    RequestIsNotWellFormedSyntacticallyIncorrectOrViolatesSchema = <any>(
      'Request is not well-formed, syntactically incorrect, or violates schema.'
    ),
  }
}
