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

export class PATCHVALUEREQUIRED {
  'issue'?: PATCHVALUEREQUIRED.IssueEnum;
  'description'?: PATCHVALUEREQUIRED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PATCHVALUEREQUIRED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PATCHVALUEREQUIRED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PATCHVALUEREQUIRED.attributeTypeMap;
  }
}

export namespace PATCHVALUEREQUIRED {
  export enum IssueEnum {
    PatchValueRequired = <any>'PATCH_VALUE_REQUIRED',
  }
  export enum DescriptionEnum {
    PleaseSpecifyAValueToForTheFieldThatIsBeingPatched = <any>(
      "Please specify a 'value' to for the field that is being patched."
    ),
  }
}