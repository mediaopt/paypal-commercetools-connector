import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { PAYPAL_EXTENSION_PATH } from '../routes/service.route';
import { PAYPAL_WEBHOOKS_PATH } from '../routes/webhook.route';
import { createOrUpdateWebhook } from '../service/paypal.service';
import { assertError, assertString } from '../utils/assert.utils';
import { readConfiguration } from '../utils/config.utils';
import {
  createAndSetCustomObject,
  createCustomCustomerType,
  createCustomerUpdateExtension,
  createCustomPaymentInteractionType,
  createCustomPaymentType,
  createPaymentUpdateExtension,
} from './actions';
import { logger } from '../utils/logger.utils';

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);
  logger.info(`Connection to ${applicationUrl}`);

  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  const apiRoot = createApiRoot();
  logger.info('root created');
  await createPaymentUpdateExtension(apiRoot, applicationUrl);
  await createCustomerUpdateExtension(apiRoot, applicationUrl);
  await createCustomPaymentType(apiRoot);
  await createCustomCustomerType(apiRoot);
  await createCustomPaymentInteractionType(apiRoot);
  await createOrUpdateWebhook(
    applicationUrl.replace(PAYPAL_EXTENSION_PATH, PAYPAL_WEBHOOKS_PATH)
  );
  await createAndSetCustomObject(apiRoot);
  logger.info('all root procedures passed');
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
