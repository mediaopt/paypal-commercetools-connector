import { describe, expect } from '@jest/globals';

let apiRequest: any = undefined;
let apiRoot: any = undefined;
const mockConfigModule = () => {
  apiRequest = {
    execute: jest.fn(() => ({ body: { results: [] } })),
  };
  apiRoot = {
    extensions: jest.fn(() => apiRoot),
    types: jest.fn(() => apiRoot),
    customObjects: jest.fn(() => apiRoot),
    withKey: jest.fn(() => apiRoot),
    withContainerAndKey: jest.fn(() => apiRoot),
    delete: jest.fn(() => apiRequest),
    get: jest.fn(() => apiRequest),
    post: jest.fn(() => apiRequest),
  };
  jest.mock('../src/client/create.client', () => {
    return {
      createApiRoot: () => apiRoot,
    };
  });
};
mockConfigModule();

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe('Testing post deploy', () => {
  test('Testing post deploy', async () => {
    const webhooksApi = {
      webhooksList: jest.fn(() => ({ data: { webhooks: [] } })),
      webhooksPost: jest.fn(() => ({ data: { id: 1 } })),
    };
    jest.mock('../src/paypal/webhooks_api', () => ({
      WebhooksApi: jest.fn().mockImplementation(() => webhooksApi),
    }));
    require('../src/connector/post-deploy');
    await sleep(19000);
    expect(apiRoot.post).toBeCalledTimes(8);
    expect(apiRoot.delete).toBeCalledTimes(0);
    expect(apiRoot.get).toBeCalledTimes(8);
    expect(apiRequest.execute).toBeCalledTimes(16);
    expect(webhooksApi.webhooksList).toBeCalledTimes(1);
    expect(webhooksApi.webhooksPost).toBeCalledTimes(1);
  }, 20000);
});
