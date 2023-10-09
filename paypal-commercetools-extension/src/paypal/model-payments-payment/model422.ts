import { Model422IssuesInner } from './model422IssuesInner';

export class Model422 {
  'issues'?: Array<Model422IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model422IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model422.attributeTypeMap;
  }
}
