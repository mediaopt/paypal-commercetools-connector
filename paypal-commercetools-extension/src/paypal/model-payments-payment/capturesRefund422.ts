import { CapturesRefund422IssuesInner } from './capturesRefund422IssuesInner';

export class CapturesRefund422 {
  'issues'?: Array<CapturesRefund422IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<CapturesRefund422IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return CapturesRefund422.attributeTypeMap;
  }
}
