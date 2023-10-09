import { Money } from './money';
import { PaymentInstruction } from './paymentInstruction';

export class CaptureRequestAllOf {
  'amount'?: Money;
  /**
   * The API caller-provided external invoice number for this order. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'invoiceId'?: string;
  /**
   * Indicates whether you can make additional captures against the authorized payment. Set to `true` if you do not intend to capture additional payments against the authorization. Set to `false` if you intend to capture additional payments against the authorization.
   */
  'finalCapture'?: boolean = false;
  'paymentInstruction'?: PaymentInstruction;
  /**
   * An informational note about this settlement. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'noteToPayer'?: string;
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
      name: 'noteToPayer',
      baseName: 'note_to_payer',
      type: 'string',
    },
    {
      name: 'softDescriptor',
      baseName: 'soft_descriptor',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return CaptureRequestAllOf.attributeTypeMap;
  }
}
