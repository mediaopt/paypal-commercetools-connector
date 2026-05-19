import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr/dist/commercetools-frontend-application-shell-ssr.cjs.js';
import type { ApplicationWindow } from '@commercetools-frontend/constants';

export const entryPointUriPath =
  (typeof window === 'undefined'
    ? process.env.ENTRY_POINT_URI_PATH
    : (window as unknown as ApplicationWindow).app.entryPointUriPath) ??
  'paypal-payment-panel';
export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME =
  'paypal-commercetools-connector';

export const GRAPHQL_CUSTOMOBJECT_KEY_NAME = 'settings';
