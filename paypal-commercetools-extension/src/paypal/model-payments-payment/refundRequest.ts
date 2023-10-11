import { Money } from './money';
import { PaymentInstruction2 } from './paymentInstruction2';

/**
 * Refunds a captured payment, by ID. For a full refund, include an empty request body. For a partial refund, include an <code>amount</code> object in the request body.
 */
export class RefundRequest {
  'amount'?: Money;
  /**
   * The API caller-provided external ID. Used to reconcile API caller-initiated transactions with PayPal transactions. Appears in transaction and settlement reports. The pattern is defined by an external party and supports Unicode.
   */
  'customId'?: string;
  /**
   * The API caller-provided external invoice ID for this order. The pattern is defined by an external party and supports Unicode.
   */
  'invoiceId'?: string;
  /**
   * The reason for the refund. Appears in both the payer\'s transaction history and the emails that the payer receives. The pattern is defined by an external party and supports Unicode.
   */
  'noteToPayer'?: string;
  'paymentInstruction'?: PaymentInstruction2;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'amount',
      baseName: 'amount',
      type: 'Money',
    },
    {
      name: 'customId',
      baseName: 'custom_id',
      type: 'string',
    },
    {
      name: 'invoiceId',
      baseName: 'invoice_id',
      type: 'string',
    },
    {
      name: 'noteToPayer',
      baseName: 'note_to_payer',
      type: 'string',
    },
    {
      name: 'paymentInstruction',
      baseName: 'payment_instruction',
      type: 'PaymentInstruction2',
    },
  ];

  static getAttributeTypeMap() {
    return RefundRequest.attributeTypeMap;
  }
}
