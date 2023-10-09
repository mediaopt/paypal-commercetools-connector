import { AuthorizationsReauthorize422IssuesInner } from './authorizationsReauthorize422IssuesInner';

export class AuthorizationsReauthorize422 {
  'issues'?: Array<AuthorizationsReauthorize422IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsReauthorize422IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsReauthorize422.attributeTypeMap;
  }
}
