import { LinkDescription } from './linkDescription';
import { MerchantPayableBreakdown } from './merchantPayableBreakdown';
import { Money } from './money';
import { PayeeBase } from './payeeBase';

export class RefundAllOf {
  /**
   * The PayPal-generated ID for the refund.
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
  /**
   * Reference ID issued for the card transaction. This ID can be used to track the transaction across processors, card brands and issuing banks.
   */
  'acquirerReferenceNumber'?: string;
  /**
   * The reason for the refund. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'noteToPayer'?: string;
  'sellerPayableBreakdown'?: MerchantPayableBreakdown;
  'payer'?: PayeeBase;
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
      name: 'acquirerReferenceNumber',
      baseName: 'acquirer_reference_number',
      type: 'string',
    },
    {
      name: 'noteToPayer',
      baseName: 'note_to_payer',
      type: 'string',
    },
    {
      name: 'sellerPayableBreakdown',
      baseName: 'seller_payable_breakdown',
      type: 'MerchantPayableBreakdown',
    },
    {
      name: 'payer',
      baseName: 'payer',
      type: 'PayeeBase',
    },
    {
      name: 'links',
      baseName: 'links',
      type: 'Array<LinkDescription>',
    },
  ];

  static getAttributeTypeMap() {
    return RefundAllOf.attributeTypeMap;
  }
}
