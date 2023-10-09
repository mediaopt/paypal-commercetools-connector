import { DisbursementMode } from './disbursementMode';
import { PlatformFee } from './platformFee';

/**
 * Any additional payment instructions to be consider during payment processing. This processing instruction is applicable for Capturing an order or Authorizing an Order.
 */
export class PaymentInstruction {
  /**
   * An array of various fees, commissions, tips, or donations. This field is only applicable to merchants that been enabled for PayPal Commerce Platform for Marketplaces and Platforms capability.
   */
  'platformFees'?: Array<PlatformFee>;
  'disbursementMode'?: DisbursementMode;
  /**
   * This field is only enabled for selected merchants/partners to use and provides the ability to trigger a specific pricing rate/plan for a payment transaction. The list of eligible \'payee_pricing_tier_id\' would be provided to you by your Account Manager. Specifying values other than the one provided to you by your account manager would result in an error.
   */
  'payeePricingTierId'?: string;
  /**
   * FX identifier generated returned by PayPal to be used for payment processing in order to honor FX rate (for eligible integrations) to be used when amount is settled/received into the payee account.
   */
  'payeeReceivableFxRateId'?: string;

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
    {
      name: 'disbursementMode',
      baseName: 'disbursement_mode',
      type: 'DisbursementMode',
    },
    {
      name: 'payeePricingTierId',
      baseName: 'payee_pricing_tier_id',
      type: 'string',
    },
    {
      name: 'payeeReceivableFxRateId',
      baseName: 'payee_receivable_fx_rate_id',
      type: 'string',
    },
  ];

  static getAttributeTypeMap() {
    return PaymentInstruction.attributeTypeMap;
  }
}

export namespace PaymentInstruction {}
