import dotenv from 'dotenv';

dotenv.config();

import { createApiRoot } from '../client/create.client';
import { deleteWebhook } from '../service/paypal.service';
import { assertError } from '../utils/assert.utils';
import { logger } from '../utils/logger.utils';
import {
  deleteAccessTokenIfExists,
  deleteExtension,
  deleteOrUpdateCustomType,
} from './actions';
import {
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PAYMENT_TYPE_KEY,
} from '../constants';

async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteWebhook();
  await deleteAccessTokenIfExists();
  await deleteOrUpdateCustomType(apiRoot, PAYPAL_PAYMENT_TYPE_KEY);
  await deleteOrUpdateCustomType(apiRoot, PAYPAL_CUSTOMER_TYPE_KEY);
  await deleteOrUpdateCustomType(apiRoot, PAYPAL_PAYMENT_INTERACTION_TYPE_KEY);
  await deleteExtension(apiRoot, PAYPAL_PAYMENT_EXTENSION_KEY);
  await deleteExtension(apiRoot, PAYPAL_CUSTOMER_EXTENSION_KEY);
}

async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    logger.error(error.message);
    process.stderr.write(`Pre-undeploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
