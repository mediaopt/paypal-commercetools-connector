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

export class MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS {
  'issue'?: MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.IssueEnum;
  'description'?: MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.attributeTypeMap;
  }
}

export namespace MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS {
  export enum IssueEnum {
    MerchantInitiatedWithMultiplePurchaseUnits = <any>(
      'MERCHANT_INITIATED_WITH_MULTIPLE_PURCHASE_UNITS'
    ),
  }
  export enum DescriptionEnum {
    StoredPaymentSourcePaymentInitiatorMerchantIsNotSupportedIfMoreThanOnePurchaseUnitIsPresentInTheOrderMerchantInitiatedPaymentsAreNotSupportedFromOrdersWithMoreThanOnePurchaseUnitPleaseRetryTheRequestWithMultipleOrderRequestsOneForEachPurchaseUnit = <
      any
    >'`stored_payment_source.payment_initiator` = `MERCHANT` is not supported if more than one purchase_unit is present in the Order. Merchant initiated payments are not supported from orders with more than one purchase_unit. Please retry the request with multiple Order requests (one for each purchase_unit).',
  }
}
