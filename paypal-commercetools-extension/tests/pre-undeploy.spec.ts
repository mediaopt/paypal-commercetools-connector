import { describe, expect } from '@jest/globals';

let apiRequest: any = undefined;
let apiRoot: any = undefined;
const mockConfigModule = () => {
  apiRequest = {
    execute: jest.fn(() => ({
      body: {
        results: [
          {
            destination: {
              type: 'HTTP',
              url: 'https://lorem.ipsum',
            },
            key: 'paymentInteractionMockType',
            fieldDefinitions: [
              { name: 'type' },
              { name: 'data' },
              { name: 'timestamp' },
            ],
          },
        ],
      },
    })),
  };
  apiRoot = {
    customObjects: jest.fn(() => apiRoot),
    types: jest.fn(() => apiRoot),
    extensions: jest.fn(() => apiRoot),
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

describe('Testing pre undeploy', () => {
  test('Testing pre undeploy', async () => {
    require('../src/connector/pre-undeploy');
    await sleep(5000);
    expect(apiRoot.delete).toBeCalledTimes(4);
    expect(apiRoot.get).toBeCalledTimes(8);
    expect(apiRoot.post).toBeCalledTimes(2);
    expect(apiRequest.execute).toBeCalledTimes(14);
  }, 15000);
});
