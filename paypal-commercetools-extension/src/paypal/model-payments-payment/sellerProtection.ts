/**
 * The level of protection offered as defined by [PayPal Seller Protection for Merchants](https://www.paypal.com/us/webapps/mpp/security/seller-protection).
 */
export class SellerProtection {
  /**
   * Indicates whether the transaction is eligible for seller protection. For information, see [PayPal Seller Protection for Merchants](https://www.paypal.com/us/webapps/mpp/security/seller-protection).
   */
  'status'?: SellerProtection.StatusEnum;
  /**
   * An array of conditions that are covered for the transaction.
   */
  'disputeCategories'?: Array<SellerProtection.DisputeCategoriesEnum>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'status',
      baseName: 'status',
      type: 'SellerProtection.StatusEnum',
    },
    {
      name: 'disputeCategories',
      baseName: 'dispute_categories',
      type: 'Array<SellerProtection.DisputeCategoriesEnum>',
    },
  ];

  static getAttributeTypeMap() {
    return SellerProtection.attributeTypeMap;
  }
}

export namespace SellerProtection {
  export enum StatusEnum {
    Eligible = <any>'ELIGIBLE',
    PartiallyEligible = <any>'PARTIALLY_ELIGIBLE',
    NotEligible = <any>'NOT_ELIGIBLE',
  }
  export enum DisputeCategoriesEnum {
    ItemNotReceived = <any>'ITEM_NOT_RECEIVED',
    UnauthorizedTransaction = <any>'UNAUTHORIZED_TRANSACTION',
  }
}
