import { LinkDescription } from './linkDescription';
import { Money } from './money';
import { NetworkTransactionReference } from './networkTransactionReference';
import { SellerProtection } from './sellerProtection';

export class AuthorizationAllOf {
  /**
   * The PayPal-generated ID for the authorized payment.
   */
  'id'?: string;
  'amount'?: Money;
  /**
   * The API caller-provided external invoice number for this order. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'invoiceId'?: string;
  /**
   * The API caller-provided external ID. Used to reconcile API caller-initiated transactions with PayPal transactions. Appears in transaction and settlement reports.
   */
  'customId'?: string;
  'networkTransactionReference'?: NetworkTransactionReference;
  'sellerProtection'?: SellerProtection;
  /**
   * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Seconds are required while fractional seconds are optional.<blockquote><strong>Note:</strong> The regular expression provides guidance but does not reject all invalid dates.</blockquote>
   */
  'expirationTime'?: string;
  /**
   * An array of related [HATEOAS links](/docs/api/reference/api-responses/#hateoas-links).
   */
  'links'?: Array<LinkDescription>;

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
      name: 'amount',
      baseName: 'amount',
      type: 'Money',
    },
    {
      name: 'invoiceId',
      baseName: 'invoice_id',
      type: 'string',
    },
    {
      name: 'customId',
      baseName: 'custom_id',
      type: 'string',
    },
    {
      name: 'networkTransactionReference',
      baseName: 'network_transaction_reference',
      type: 'NetworkTransactionReference',
    },
    {
      name: 'sellerProtection',
      baseName: 'seller_protection',
      type: 'SellerProtection',
    },
    {
      name: 'expirationTime',
      baseName: 'expiration_time',
      type: 'string',
    },
    {
      name: 'links',
      baseName: 'links',
      type: 'Array<LinkDescription>',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationAllOf.attributeTypeMap;
  }
}
