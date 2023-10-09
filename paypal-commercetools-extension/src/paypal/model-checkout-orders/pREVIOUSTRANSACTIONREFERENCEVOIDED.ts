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

export class PREVIOUSTRANSACTIONREFERENCEVOIDED {
  'issue'?: PREVIOUSTRANSACTIONREFERENCEVOIDED.IssueEnum;
  'description'?: PREVIOUSTRANSACTIONREFERENCEVOIDED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'PREVIOUSTRANSACTIONREFERENCEVOIDED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'PREVIOUSTRANSACTIONREFERENCEVOIDED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return PREVIOUSTRANSACTIONREFERENCEVOIDED.attributeTypeMap;
  }
}

export namespace PREVIOUSTRANSACTIONREFERENCEVOIDED {
  export enum IssueEnum {
    PreviousTransactionReferenceVoided = <any>(
      'PREVIOUS_TRANSACTION_REFERENCE_VOIDED'
    ),
  }
  export enum DescriptionEnum {
    TheStatusOfAuthorizationReferencedByPreviousTransactionReferenceIsVoidedAndHenceCannotBeUsedForThisOrderPleaseUseAPreviousTransactionReferenceWhoseStatusIsNotVoided = <
      any
    >'The status of authorization referenced by `previous_transaction_reference` is `VOIDED` and hence cannot be used for this order. Please use a `previous_transaction_reference` whose status is not `VOIDED`.',
  }
}