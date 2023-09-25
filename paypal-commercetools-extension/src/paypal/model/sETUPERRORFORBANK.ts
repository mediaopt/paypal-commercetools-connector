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

export class SETUPERRORFORBANK {
  'issue'?: SETUPERRORFORBANK.IssueEnum;
  'description'?: SETUPERRORFORBANK.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'SETUPERRORFORBANK.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'SETUPERRORFORBANK.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return SETUPERRORFORBANK.attributeTypeMap;
  }
}

export namespace SETUPERRORFORBANK {
  export enum IssueEnum {
    SetupErrorForBank = <any>'SETUP_ERROR_FOR_BANK',
  }
  export enum DescriptionEnum {
    TheApiCallerAccountSetupForBankPaymentsIsIncompleteOrIncorrectPleaseContactYourPayPalAccountManager = <
      any
    >'The API Caller account setup, for bank payments, is incomplete or incorrect. Please contact your PayPal account manager.',
  }
}
