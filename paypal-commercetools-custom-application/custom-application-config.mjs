import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptions}
 */
const config = {
  name: 'PayPal - Partner Payment Panel',
  description: 'The all-in-one checkout solution',
  entryPointUriPath,
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: '${env:CTP_INITIAL_PROJECT_KEY}',
    },
    production: {
      applicationId: '${env:APPLICATION_ID}',
      url: 'https://your_app_hostname.com',
    },
  },
  oAuthScopes: {
    view: ['view_key_value_documents', 'view_project_settings'],
    manage: ['manage_key_value_documents'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/stamp.svg}',
  mainMenuLink: {
    defaultLabel: 'PayPal Partner Payment Panel',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'settings',
      defaultLabel: 'Settings',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
  ],
};

export default config;
