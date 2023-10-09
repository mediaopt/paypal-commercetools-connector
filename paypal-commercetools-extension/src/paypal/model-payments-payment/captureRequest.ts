import { Money } from './money';
import { PaymentInstruction } from './paymentInstruction';

/**
 * Captures either a portion or the full authorized amount of an authorized payment.
 */
export class CaptureRequest {
  /**
   * The API caller-provided external invoice number for this order. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'invoiceId'?: string;
  /**
   * An informational note about this settlement. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'noteToPayer'?: string;
  'amount'?: Money;
  /**
   * Indicates whether you can make additional captures against the authorized payment. Set to `true` if you do not intend to capture additional payments against the authorization. Set to `false` if you intend to capture additional payments against the authorization.
   */
  'finalCapture'?: boolean = false;
  'paymentInstruction'?: PaymentInstruction;
  /**
   * The payment descriptor on the payer\'s account statement.
   */
  'softDescriptor'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
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
      name: 'amount',
      baseName: 'amount',
      type: 'Money',
    },
    {
      name: 'finalCapture',
      baseName: 'final_capture',
      type: 'boolean',
    },
    {
      name: 'paymentInstruction',
      baseName: 'payment_instruction',
      type: 'PaymentInstruction',
    },
    {
      name: 'softDescriptor',
      baseName: 'soft_descriptor',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CaptureRequest.attributeTypeMap;
  }
}
