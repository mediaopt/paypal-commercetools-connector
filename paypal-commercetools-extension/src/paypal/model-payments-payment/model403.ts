import { Model403IssuesInner } from './model403IssuesInner';

export class Model403 {
  'issues'?: Array<Model403IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model403IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model403.attributeTypeMap;
  }
}
