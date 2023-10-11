import { Model401IssuesInner } from './model401IssuesInner';

export class Model401 {
  'issues'?: Array<Model401IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model401IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model401.attributeTypeMap;
  }
}
