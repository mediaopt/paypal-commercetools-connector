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

import { Model401IssuesInner } from './model401IssuesInner';

export class OrdersCreate401Response {
  'name'?: OrdersCreate401Response.NameEnum;
  'message'?: OrdersCreate401Response.MessageEnum;
  'issues'?: Array<Model401IssuesInner>;
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
      type: 'OrdersCreate401Response.NameEnum',
    },
    {
      name: 'message',
      baseName: 'message',
      type: 'OrdersCreate401Response.MessageEnum',
    },
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model401IssuesInner>',
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
    return OrdersCreate401Response.attributeTypeMap;
  }
}

export namespace OrdersCreate401Response {
  export enum NameEnum {
    AuthenticationFailure = <any>'AUTHENTICATION_FAILURE',
  }
  export enum MessageEnum {
    AuthenticationFailedDueToMissingAuthorizationHeaderOrInvalidAuthenticationCredentials = <
      any
    >'Authentication failed due to missing authorization header, or invalid authentication credentials.',
  }
}
