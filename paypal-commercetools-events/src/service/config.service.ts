import { createApiRoot } from '../client/create.client';
import { AccessTokenObject, PayPalSettings } from '../types/index.types';
import { logger } from '../utils/logger.utils';

const tokenKey = (storeKey?: string) =>
  `accessToken${storeKey ? `-${storeKey}` : ''}`;
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
export const getCachedAccessToken = async (storeKey?: string) => {
  try {
    const apiRoot = createApiRoot();
    return (
      await apiRoot
        .customObjects()
        .withContainerAndKey({
          container: 'paypal-commercetools-connector',
          key: tokenKey(storeKey),
        })
        .get()
        .execute()
    ).body;
  } catch (e) {
    logger.warn(`Failed to load cached access token ${storeKey ?? ''}`, e);
    return undefined;
  }
};

export const cacheAccessToken = async (
  token: AccessTokenObject,
  version: number,
  storeKey?: string
) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .post({
      body: {
        container: 'paypal-commercetools-connector',
        key: tokenKey(storeKey),
        value: token,
        version: version,
      },
    })
    .execute();
};

export const deleteAccessToken = async (storeKey?: string) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .withContainerAndKey({
      container: 'paypal-commercetools-connector',
      key: tokenKey(storeKey),
    })
    .delete()
    .execute();
};
