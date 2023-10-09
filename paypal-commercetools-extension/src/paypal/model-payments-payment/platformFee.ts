import { Money } from './money';
import { PayeeBase } from './payeeBase';

/**
 * The platform or partner fee, commission, or brokerage fee that is associated with the transaction. Not a separate or isolated transaction leg from the external perspective. The platform fee is limited in scope and is always associated with the original payment for the purchase unit.
 */
export class PlatformFee {
  'amount': Money;
  'payee'?: PayeeBase;

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
      name: 'payee',
      baseName: 'payee',
      type: 'PayeeBase',
    },
  ];

  static getAttributeTypeMap() {
    return PlatformFee.attributeTypeMap;
  }
}
