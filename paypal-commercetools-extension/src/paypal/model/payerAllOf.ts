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

import { AddressPortable } from './addressPortable';
import { Name } from './name';
import { PhoneWithType } from './phoneWithType';
import { TaxInfo } from './taxInfo';

export class PayerAllOf {
  'name'?: Name;
  'phone'?: PhoneWithType;
  /**
   * The stand-alone date, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). To represent special legal values, such as a date of birth, you should use dates with no associated time or time-zone data. Whenever possible, use the standard `date_time` type. This regular expression does not validate all dates. For example, February 31 is valid and nothing is known about leap years.
   */
  'birthDate'?: string;
  'taxInfo'?: TaxInfo;
  'address'?: AddressPortable;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'name',
      baseName: 'name',
      type: 'Name',
    },
    {
      name: 'phone',
      baseName: 'phone',
      type: 'PhoneWithType',
    },
    {
      name: 'birthDate',
      baseName: 'birth_date',
      type: 'string',
    },
    {
      name: 'taxInfo',
      baseName: 'tax_info',
      type: 'TaxInfo',
    },
    {
      name: 'address',
      baseName: 'address',
      type: 'AddressPortable',
    },
  ];

  static getAttributeTypeMap() {
    return PayerAllOf.attributeTypeMap;
  }
}
