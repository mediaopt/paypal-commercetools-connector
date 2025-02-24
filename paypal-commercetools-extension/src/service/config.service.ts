import { createApiRoot } from '../client/create.client';
import { AccessTokenObject, PayPalSettings } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {readConfiguration} from "../utils/config.utils";

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
export const getCachedAccessToken = async () => {
  try {
    const apiRoot = createApiRoot();
    return (
      await apiRoot
        .customObjects()
        .withContainerAndKey({
          container: 'paypal-commercetools-connector',
          key: getAccessTokenKey(),
        })
        .get()
        .execute()
    ).body;
  } catch (e) {
    logger.warn('Failed to load cached access token', e);
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
        key: getAccessTokenKey(),
        value: token,
        version: version,
      },
    })
    .execute();
};

export const deleteAccessToken = async () => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .withContainerAndKey({
      container: 'paypal-commercetools-connector',
      key: getAccessTokenKey(),
    })
    .delete()
    .execute();
};

const getAccessTokenKey = () => {
    const store = readConfiguration().store;
    return 'accessToken' + store ? `-${store}` : '';
}
