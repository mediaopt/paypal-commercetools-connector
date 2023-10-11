import { Model409IssuesInner } from './model409IssuesInner';

export class Model409 {
  'issues'?: Array<Model409IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model409IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model409.attributeTypeMap;
  }
}
