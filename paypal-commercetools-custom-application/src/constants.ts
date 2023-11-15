// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = 'paypal-payment-panel';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME =
  'paypal-commercetools-connector';

export const GRAPHQL_CUSTOMOBJECT_KEY_NAME = 'settings';
