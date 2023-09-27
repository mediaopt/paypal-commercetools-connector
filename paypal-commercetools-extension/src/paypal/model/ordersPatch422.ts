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

import { OrdersPatch422IssuesInner } from './ordersPatch422IssuesInner';

export class OrdersPatch422 {
  'issues'?: Array<OrdersPatch422IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<OrdersPatch422IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return OrdersPatch422.attributeTypeMap;
  }
}
