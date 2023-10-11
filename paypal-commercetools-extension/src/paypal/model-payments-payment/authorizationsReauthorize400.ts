import { AuthorizationsReauthorize400IssuesInner } from './authorizationsReauthorize400IssuesInner';

export class AuthorizationsReauthorize400 {
  'issues'?: Array<AuthorizationsReauthorize400IssuesInner>;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issues',
      baseName: 'issues',
      type: 'Array<AuthorizationsReauthorize400IssuesInner>',
    },
  ];

  static getAttributeTypeMap() {
    return AuthorizationsReauthorize400.attributeTypeMap;
  }
}
