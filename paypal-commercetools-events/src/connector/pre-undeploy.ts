import dotenv from 'dotenv';
dotenv.config();

import { createApiRoot } from '../client/create.client';
import { assertError, assertString } from '../utils/assert.utils';
import {
  deleteAccessTokenIfExists,
  deleteParcelAddedToDeliverySubscription,
} from './actions';
import { readConfiguration } from '../utils/config.utils';

const CONNECT_GCP_TOPIC_NAME_KEY = 'CONNECT_GCP_TOPIC_NAME';
const CONNECT_GCP_PROJECT_ID_KEY = 'CONNECT_GCP_PROJECT_ID';
const MULTI_TENANT_IDS = 'PAYPAL_MULTI_TENANT_CLIENT_IDS';

async function preUndeploy(properties: Map<string, unknown>): Promise<void> {
  const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
  const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);
  const isMultiTenant = !!properties.get(MULTI_TENANT_IDS);

  assertString(topicName, CONNECT_GCP_TOPIC_NAME_KEY);
  assertString(projectId, CONNECT_GCP_PROJECT_ID_KEY);

  const apiRoot = createApiRoot();
  await deleteAccessTokenIfExists(isMultiTenant ? 'multi' : 'single');
  if (!isMultiTenant)
    await deleteParcelAddedToDeliverySubscription(
      apiRoot,
      topicName,
      projectId
    );
}

async function run(): Promise<void> {
  try {
    readConfiguration(true);
    const properties = new Map(Object.entries(process.env));
    await preUndeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
