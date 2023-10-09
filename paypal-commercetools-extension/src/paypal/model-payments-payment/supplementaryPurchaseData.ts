/**
 * The capture identification-related fields. Includes the invoice ID, custom ID, note to payer, and soft descriptor.
 */
export class SupplementaryPurchaseData {
  /**
   * The API caller-provided external invoice number for this order. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'invoiceId'?: string;
  /**
   * An informational note about this settlement. Appears in both the payer\'s transaction history and the emails that the payer receives.
   */
  'noteToPayer'?: string;

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
  ];

  static getAttributeTypeMap() {
    return SupplementaryPurchaseData.attributeTypeMap;
  }
}
