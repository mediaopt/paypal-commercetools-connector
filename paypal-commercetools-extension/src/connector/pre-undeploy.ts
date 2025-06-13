import dotenv from 'dotenv';

dotenv.config();

import { createApiRoot } from '../client/create.client';
import { deleteWebhook } from '../service/paypal.service';
import { assertError, assertString } from '../utils/assert.utils';
import { readConfiguration } from '../utils/config.utils';
import { logger } from '../utils/logger.utils';
import {
  deleteAccessTokenIfExists,
  deleteExtension,
  deleteOrUpdateCustomType,
} from './actions';
import {
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
} from '../constants';

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';

async function preUndeploy(properties: Map<string, unknown>): Promise<void> {
  const apiRoot = createApiRoot();
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);
  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);
  await deleteAccessTokenIfExists();
  await deleteWebhook();
  await deleteOrUpdateCustomType(apiRoot, 'payment');
  await deleteOrUpdateCustomType(apiRoot, 'customer');
  await deleteOrUpdateCustomType(apiRoot, 'payment-interface-interaction');
  await deleteExtension(apiRoot, PAYPAL_PAYMENT_EXTENSION_KEY, applicationUrl);
  await deleteExtension(apiRoot, PAYPAL_CUSTOMER_EXTENSION_KEY, applicationUrl);
}

async function run(): Promise<void> {
  try {
    readConfiguration(true);
    const properties = new Map(Object.entries(process.env));
    await preUndeploy(properties);
  } catch (error) {
    assertError(error);
    logger.error(error.message);
    process.stderr.write(`Pre-undeploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
