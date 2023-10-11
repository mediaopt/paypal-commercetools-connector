import { Model400IssuesInner } from './model400IssuesInner';

export class Model400 {
  'issues'?: Array<Model400IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model400IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model400.attributeTypeMap;
  }
}
