/**
 * The details for the merchant who receives the funds and fulfills the order. The merchant is also known as the payee.
 */
export class PayeeBase {
  /**
   * The internationalized email address.<blockquote><strong>Note:</strong> Up to 64 characters are allowed before and 255 characters are allowed after the <code>@</code> sign. However, the generally accepted maximum length for an email address is 254 characters. The pattern verifies that an unquoted <code>@</code> sign exists.</blockquote>
   */
  'emailAddress'?: string;
  /**
   * The account identifier for a PayPal account.
   */
  'merchantId'?: string;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'emailAddress',
      baseName: 'email_address',
      type: 'string',
    },
    {
      name: 'merchantId',
      baseName: 'merchant_id',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return PayeeBase.attributeTypeMap;
  }
}
