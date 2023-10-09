import { AuthorizationsVoid422IssuesInner } from './authorizationsVoid422IssuesInner';

export class AuthorizationsVoid422 {
  'issues'?: Array<AuthorizationsVoid422IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsVoid422IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsVoid422.attributeTypeMap;
  }
}
