import { createApiRoot } from '../client/create.client';
import { AccessTokenObject, PayPalSettings } from '../types/index.types';

export const getSettings = async () => {
  try {
    const apiRoot = createApiRoot();
    const customObject = (
      await apiRoot
        .customObjects()
        .withContainerAndKey({
          container: 'paypal-commercetools-connector',
          key: 'settings',
        })
        .get()
        .execute()
    ).body;
    return customObject.value as PayPalSettings;
  } catch (e) {
    return undefined;
  }
};
export const getCachedAccessToken = async (isMultitenant = false) => {
  try {
    const apiRoot = createApiRoot();
    return (
      await apiRoot
        .customObjects()
        .withContainerAndKey({
          container: 'paypal-commercetools-connector',
          key: isMultitenant ? 'accessTokens' : 'accessToken',
        })
        .get()
        .execute()
    ).body;
  } catch (e) {
    return undefined;
  }
};

export const cacheAccessToken = async (
  token: AccessTokenObject,
  version: number
) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .post({
      body: {
        container: 'paypal-commercetools-connector',
        key: 'accessToken',
        value: token,
        version: version,
      },
    })
    .execute();
};

export const deleteAccessToken = async (isMultiTenant = false) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .withContainerAndKey({
      container: 'paypal-commercetools-connector',
      key: isMultiTenant ? 'accessTokens' : 'accessToken',
    })
    .delete()
    .execute();
};
