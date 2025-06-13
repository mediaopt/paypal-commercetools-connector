import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { createWebhook } from '../service/paypal.service';
import { assertError, assertString } from '../utils/assert.utils';
import { readConfiguration } from '../utils/config.utils';
import {
  createAndSetCustomObject,
  addOrUpdateCustomType,
  createExtension,
  deleteAccessTokenIfExists,
} from './actions';

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);

  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  const apiRoot = createApiRoot();
  await deleteAccessTokenIfExists();
  await createExtension(apiRoot, applicationUrl, 'payment');
  await createExtension(apiRoot, applicationUrl, 'customer');
  await addOrUpdateCustomType(apiRoot, 'payment');
  await addOrUpdateCustomType(apiRoot, 'customer');
  await addOrUpdateCustomType(apiRoot, 'payment-interface-interaction');
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
