import { CardBrand } from './cardBrand';

/**
 * Reference values used by the card network to identify a transaction.
 */
export class NetworkTransactionReference {
  /**
   * Transaction reference id returned by the scheme. For Visa and Amex, this is the \"Tran id\" field in response. For MasterCard, this is the \"BankNet reference id\" field in response. For Discover, this is the \"NRID\" field in response. The pattern we expect for this field from Visa/Amex/CB/Discover is numeric, Mastercard/BNPP is alphanumeric and Paysecure is alphanumeric with special character -.
   */
  'id': string;
  /**
   * The date that the transaction was authorized by the scheme. This field may not be returned for all networks. MasterCard refers to this field as \"BankNet reference date.
   */
  'date'?: string;
  'network'?: CardBrand;
  /**
   * Reference ID issued for the card transaction. This ID can be used to track the transaction across processors, card brands and issuing banks.
   */
  'acquirerReferenceNumber'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'id',
      baseName: 'id',
      type: 'string',
    },
    {
      name: 'date',
      baseName: 'date',
      type: 'string',
    },
    {
      name: 'network',
      baseName: 'network',
      type: 'CardBrand',
    },
    {
      name: 'acquirerReferenceNumber',
      baseName: 'acquirer_reference_number',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return NetworkTransactionReference.attributeTypeMap;
  }
}

export namespace NetworkTransactionReference {}
