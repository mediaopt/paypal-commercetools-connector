import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { createWebhook, createWebhooks } from '../service/paypal.service';
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

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';
const MULTI_TENANT_IDS = 'PAYPAL_MULTI_TENANT_CLIENT_IDS';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);
  const isMultiTenant = !!properties.get(MULTI_TENANT_IDS);

  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  const apiRoot = createApiRoot(); //doesn't involve multi tenant, is commercetools global
  await deleteAccessTokenIfExists(); //already accounts for multi tenant
  await createPaymentUpdateExtension(apiRoot, applicationUrl); //doesn't involve multi tenant directly, only need to pass store key if relevant
  await createCustomerUpdateExtension(apiRoot, applicationUrl); //doesn't involve multi tenant directly, only need to pass store key if relevant
  await createCustomPaymentType(apiRoot); //doesn't involve multi tenant directly, only need to pass store key if relevant
  await createCustomCustomerType(apiRoot); //doesn't involve multi tenant directly, only need to pass store key if relevant
  await createCustomPaymentInteractionType(apiRoot); //doesn't involve multi tenant directly, only need to pass store key if relevant
  if (isMultiTenant) await createWebhooks();
  else await createWebhook();
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
