import { describe, test } from '@jest/globals';
let apiRequest: any = undefined;
let apiRoot: any = undefined;
const mockConfigModule = () => {
  apiRequest = {
    execute: jest.fn(() => ({ body: { value: 'VALUE' } })),
  };
  apiRoot = {
    customObjects: jest.fn(() => apiRoot),
    withContainerAndKey: jest.fn(() => apiRoot),
    delete: jest.fn(() => apiRequest),
    get: jest.fn(() => apiRequest),
    post: jest.fn(() => apiRequest),
  };
  jest.mock('common-connect/dist/client/create.client', () => {
    return {
      createApiRoot: () => apiRoot,
    };
  });
  return apiRoot;
};
mockConfigModule();

import { getSettings } from '../src/service/config.service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Testing config service', () => {
  test('test get settings', async () => {
    const settings = await getSettings();

    expect(settings).toBe('VALUE');
    expect(apiRequest.execute).toHaveBeenCalledTimes(1);
    expect(apiRoot.get).toHaveBeenCalledTimes(1);
  });
});
