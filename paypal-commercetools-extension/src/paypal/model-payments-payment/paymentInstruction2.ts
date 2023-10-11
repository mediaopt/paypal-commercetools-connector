import { PlatformFee } from './platformFee';

/**
 * Any additional payments instructions during refund payment processing. This object is only applicable to merchants that have been enabled for PayPal Commerce Platform for Marketplaces and Platforms capability. Please speak to your account manager if you want to use this capability.
 */
export class PaymentInstruction2 {
  /**
   * Specifies the amount that the API caller will contribute to the refund being processed. The amount needs to be lower than platform_fees amount originally captured or the amount that is remaining if multiple refunds have been processed. This field is only applicable to merchants that have been enabled for PayPal Commerce Platform for Marketplaces and Platforms capability. Please speak to your account manager if you want to use this capability.
   */
  'platformFees'?: Array<PlatformFee>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'platformFees',
      baseName: 'platform_fees',
      type: 'Array<PlatformFee>',
    },
  ];

  static getAttributeTypeMap() {
    return PaymentInstruction2.attributeTypeMap;
  }
}
