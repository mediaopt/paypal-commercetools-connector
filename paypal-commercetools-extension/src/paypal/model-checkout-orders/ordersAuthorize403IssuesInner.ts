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

export class OrdersAuthorize403IssuesInner {
  'issue'?: OrdersAuthorize403IssuesInner.IssueEnum;
  'description'?: OrdersAuthorize403IssuesInner.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'OrdersAuthorize403IssuesInner.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'OrdersAuthorize403IssuesInner.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return OrdersAuthorize403IssuesInner.attributeTypeMap;
  }
}

export namespace OrdersAuthorize403IssuesInner {
  export enum IssueEnum {
    PermissionDeniedForDonationItems = <any>(
      'PERMISSION_DENIED_FOR_DONATION_ITEMS'
    ),
  }
  export enum DescriptionEnum {
    TheApiCallerOrPayeeHaveNotBeenGrantedAppropriatePermissionsToSendItemsCategoryAsDonationPleaseSpeakToYourAccountManagerIfYouWantToProcessTheseTypeOfItems = <
      any
    >"The API Caller or Payee have not been granted appropriate permissions to send 'items.category' as 'DONATION'. Please speak to your account manager if you want to process these type of items.",
  }
}