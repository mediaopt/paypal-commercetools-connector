import { describe, expect } from '@jest/globals';
import { logger } from '../src/utils/logger.utils';

const apiRequest = {
  execute: jest.fn(() => ({ body: { results: [] } })),
};

const apiRoot: any = {
  extensions: jest.fn(() => apiRoot),
  types: jest.fn(() => apiRoot),
  customObjects: jest.fn(() => apiRoot),
  withKey: jest.fn(() => apiRoot),
  withContainerAndKey: jest.fn(() => apiRoot),
  delete: jest.fn(() => apiRequest),
  get: jest.fn(() => apiRequest),
  post: jest.fn(() => apiRequest),
};

const webhooksApi = {
  webhooksList: jest.fn(() => ({ data: { webhooks: [] } })),
  webhooksPost: jest.fn(() => ({ data: { id: 1 } })),
};

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe('Testing post deploy', () => {
  test('Testing post deploy', async () => {
    jest.mock('../src/paypal/webhooks_api', () => ({
      WebhooksApi: jest.fn().mockImplementation(() => webhooksApi),
    }));
    jest.mock('../src/client/create.client', () => {
      return {
        createApiRoot: () => apiRoot,
      };
    });
    require('../src/connector/post-deploy');
    await sleep(19000);
    logger.info(JSON.stringify(apiRoot.post));
    expect(webhooksApi.webhooksList).toBeCalledTimes(1);
    expect(webhooksApi.webhooksPost).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(8);
    expect(apiRoot.delete).toBeCalledTimes(0);
    expect(apiRoot.get).toBeCalledTimes(8);
    expect(apiRequest.execute).toBeCalledTimes(16);
  }, 20000);
});
