import { RelatedIds } from './relatedIds';

/**
 * The supplementary data.
 */
export class SupplementaryData {
  'relatedIds'?: RelatedIds;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'relatedIds',
      baseName: 'related_ids',
      type: 'RelatedIds',
    },
  ];

  static getAttributeTypeMap() {
    return SupplementaryData.attributeTypeMap;
  }
}
