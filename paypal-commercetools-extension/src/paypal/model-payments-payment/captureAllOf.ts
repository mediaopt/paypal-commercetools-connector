import { DisbursementMode } from './disbursementMode';
import { LinkDescription } from './linkDescription';
import { Money } from './money';
import { NetworkTransactionReference } from './networkTransactionReference';
import { ProcessorResponse } from './processorResponse';
import { SellerProtection } from './sellerProtection';
import { SellerReceivableBreakdown } from './sellerReceivableBreakdown';

export class CaptureAllOf {
  /**
   * The PayPal-generated ID for the captured payment.
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
   * Indicates whether you can make additional captures against the authorized payment. Set to `true` if you do not intend to capture additional payments against the authorization. Set to `false` if you intend to capture additional payments against the authorization.
   */
  'finalCapture'?: boolean = false;
  'sellerReceivableBreakdown'?: SellerReceivableBreakdown;
  'disbursementMode'?: DisbursementMode;
  /**
   * An array of related [HATEOAS links](/docs/api/reference/api-responses/#hateoas-links).
   */
  'links'?: Array<LinkDescription>;
  'processorResponse'?: ProcessorResponse;

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
      name: 'finalCapture',
      baseName: 'final_capture',
      type: 'boolean',
    },
    {
      name: 'sellerReceivableBreakdown',
      baseName: 'seller_receivable_breakdown',
      type: 'SellerReceivableBreakdown',
    },
    {
      name: 'disbursementMode',
      baseName: 'disbursement_mode',
      type: 'DisbursementMode',
    },
    {
      name: 'links',
      baseName: 'links',
      type: 'Array<LinkDescription>',
    },
    {
      name: 'processorResponse',
      baseName: 'processor_response',
      type: 'ProcessorResponse',
    },
  ];

  static getAttributeTypeMap() {
    return CaptureAllOf.attributeTypeMap;
  }
}

export namespace CaptureAllOf {}
