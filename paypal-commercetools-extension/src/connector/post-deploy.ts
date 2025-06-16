import dotenv from 'dotenv';
import { createApiRoot } from '../client/create.client';
import { createWebhook } from '../service/paypal.service';
import { assertError, assertString } from '../utils/assert.utils';
import { readConfiguration } from '../utils/config.utils';
import {
  addOrUpdateCustomType,
  createAndSetCustomObject,
  createExtension,
  deleteAccessTokenIfExists,
} from './actions';
import {
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PAYMENT_TYPE_KEY,
} from '../constants';

dotenv.config();

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);

  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  const apiRoot = createApiRoot();
  await deleteAccessTokenIfExists();
  await createExtension(apiRoot, applicationUrl, PAYPAL_PAYMENT_EXTENSION_KEY);
  await createExtension(apiRoot, applicationUrl, PAYPAL_CUSTOMER_EXTENSION_KEY);
  await addOrUpdateCustomType(apiRoot, PAYPAL_PAYMENT_TYPE_KEY);
  await addOrUpdateCustomType(apiRoot, PAYPAL_CUSTOMER_TYPE_KEY);
  await addOrUpdateCustomType(apiRoot, PAYPAL_PAYMENT_INTERACTION_TYPE_KEY);
  await createWebhook();
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
