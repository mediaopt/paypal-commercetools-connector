import { CapturesRefund400IssuesInner } from './capturesRefund400IssuesInner';

export class CapturesRefund400 {
  'issues'?: Array<CapturesRefund400IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<CapturesRefund400IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return CapturesRefund400.attributeTypeMap;
  }
}
