import { createApiRoot } from '../client/create.client';
import { AccessTokenObject, PayPalSettings } from '../types/index.types';
import { logger } from '../utils/logger.utils';

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
    logger.error('Failed to load settings from custom object', e);
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
          key: isMultitenant ? 'assessTokens' : 'accessToken',
        })
        .get()
        .execute()
    ).body;
  } catch (e) {
    logger.warn(
      `Failed to load cached access token${isMultitenant ? 's' : ''}`,
      e
    );
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

export const cacheAccessTokens = async (
  tokens: AccessTokenObject[],
  version: number
) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .post({
      body: {
        container: 'paypal-commercetools-connector',
        key: 'accessTokens',
        value: tokens,
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
