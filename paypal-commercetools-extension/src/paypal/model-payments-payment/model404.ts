import { Model404IssuesInner } from './model404IssuesInner';

export class Model404 {
  'issues'?: Array<Model404IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<Model404IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return Model404.attributeTypeMap;
  }
}
