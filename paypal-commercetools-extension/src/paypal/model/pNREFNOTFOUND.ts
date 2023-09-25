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

export class PNREFNOTFOUND {
  'issue'?: PNREFNOTFOUND.IssueEnum;
  'description'?: PNREFNOTFOUND.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PNREFNOTFOUND.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PNREFNOTFOUND.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PNREFNOTFOUND.attributeTypeMap;
  }
}

export namespace PNREFNOTFOUND {
  export enum IssueEnum {
    PnrefNotFound = <any>'PNREF_NOT_FOUND',
  }
  export enum DescriptionEnum {
    SpecifiedPnrefWasNotFoundVerifyTheValueAndTryTheRequestAgain = <any>(
      'Specified `pnref` was not found. Verify the value and try the request again.'
    ),
  }
}
