import { PayeeBase } from './payeeBase';
import { SupplementaryData } from './supplementaryData';

export class Authorization2AllOf {
  'supplementaryData'?: SupplementaryData;
  'payee'?: PayeeBase;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'supplementaryData',
      baseName: 'supplementary_data',
      type: 'SupplementaryData',
    },
    {
      name: 'payee',
      baseName: 'payee',
      type: 'PayeeBase',
    },
  ];

  static getAttributeTypeMap() {
    return Authorization2AllOf.attributeTypeMap;
  }
}
