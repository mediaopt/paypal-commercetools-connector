import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { createWebhook } from '../service/paypal.service';
import { assertError, assertString } from '../utils/assert.utils';
import { readConfiguration } from '../utils/config.utils';
import {
  createAndSetCustomObject,
  createCustomCustomerType,
  createCustomerUpdateExtension,
  createCustomPaymentInteractionType,
  createCustomPaymentType,
  createPaymentUpdateExtension,
  deleteAccessTokenIfExists,
} from './actions';
import { logger } from '../utils/logger.utils';

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';
const MULTI_TENANT_IDS = 'PAYPAL_MULTI_TENANT_CLIENT_IDS';
const PAYPAL_DEFAULT_ID = 'PAYPAL_CLIENT_ID';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);
  const multiTenant = properties.get(MULTI_TENANT_IDS);
  logger.info(`is multi tenant store: ${!!multiTenant}`);
  const multiTenantShopKeys =
    typeof multiTenant === 'string'
      ? Object.keys(JSON.parse(multiTenant))
      : undefined;
  const paypalDefaultId = properties.get(PAYPAL_DEFAULT_ID);
  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  const apiRoot = createApiRoot();
  if (multiTenantShopKeys)
    await Promise.all(
      multiTenantShopKeys.map((shopKey) => deleteAccessTokenIfExists(shopKey))
    );
  await deleteAccessTokenIfExists();
  logger.info('previous access token(s) deleted');
  await createPaymentUpdateExtension(apiRoot, applicationUrl);
  await createCustomerUpdateExtension(apiRoot, applicationUrl);
  await createCustomPaymentType(apiRoot);
  await createCustomCustomerType(apiRoot);
  await createCustomPaymentInteractionType(apiRoot);
  logger.info('commercetools custom objects set successfully');
  if (typeof multiTenant === 'string') {
    await Promise.all(
      Object.keys(JSON.parse(multiTenant)).map((shopKey) =>
        createWebhook(shopKey)
      )
    );
  }
  if (paypalDefaultId) {
    await createWebhook();
  }
  logger.info('PayPal webhooks created');
  await createAndSetCustomObject(apiRoot);
}

async function run(): Promise<void> {
  try {
    readConfiguration(true);
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
