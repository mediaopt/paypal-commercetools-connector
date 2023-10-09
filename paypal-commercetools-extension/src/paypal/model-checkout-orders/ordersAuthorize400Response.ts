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

import { OrdersAuthorize400IssuesInner } from './ordersAuthorize400IssuesInner';

export class OrdersAuthorize400Response {
  'name'?: OrdersAuthorize400Response.NameEnum;
  'message'?: OrdersAuthorize400Response.MessageEnum;
  'issues'?: Array<OrdersAuthorize400IssuesInner>;
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
      type: 'OrdersAuthorize400Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'OrdersAuthorize400Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<OrdersAuthorize400IssuesInner>',
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
    return OrdersAuthorize400Response.attributeTypeMap;
  }
}

export namespace OrdersAuthorize400Response {
  export enum NameEnum {
    InvalidRequest = <any>'INVALID_REQUEST',
  }
  export enum MessageEnum {
    RequestIsNotWellFormedSyntacticallyIncorrectOrViolatesSchema = <any>(
      'Request is not well-formed, syntactically incorrect, or violates schema.'
    ),
  }
}