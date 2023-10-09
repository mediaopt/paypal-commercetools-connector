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

/**
 * The JSON patch object to apply partial updates to resources.
 */
export class Patch {
  /**
   * The operation.
   */
  'op': Patch.OpEnum;
  /**
   * The <a href=\"https://tools.ietf.org/html/rfc6901\">JSON Pointer</a> to the target document location at which to complete the operation.
   */
  'path'?: string;
  /**
   * The value to apply. The <code>remove</code>, <code>copy</code>, and <code>move</code> operations do not require a value. Since <a href=\"https://www.rfc-editor.org/rfc/rfc69021\">JSON Patch</a> allows any type for <code>value</code>, the <code>type</code> property is not specified.
   */
  'value'?: any | null;
  /**
   * The <a href=\"https://tools.ietf.org/html/rfc6901\">JSON Pointer</a> to the target document location from which to move the value. Required for the <code>move</code> operation.
   */
  'from'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'op',
      baseName: 'op',
      type: 'Patch.OpEnum',
    },
    {
      name: 'path',
      baseName: 'path',
      type: 'string',
    },
    {
      name: 'value',
      baseName: 'value',
      type: 'any',
    },
    {
      name: 'from',
      baseName: 'from',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return Patch.attributeTypeMap;
  }
}

export namespace Patch {
  export enum OpEnum {
    Add = <any>'add',
    Remove = <any>'remove',
    Replace = <any>'replace',
    Move = <any>'move',
    Copy = <any>'copy',
    Test = <any>'test',
  }
}