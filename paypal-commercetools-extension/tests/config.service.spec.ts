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
  jest.mock('../src/client/create.client', () => {
    return {
      createApiRoot: () => apiRoot,
    };
  });
  return apiRoot;
};
mockConfigModule();

import {
  cacheAccessToken,
  getCachedAccessToken,
  getSettings,
} from '../src/service/config.service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Testing config service', () => {
  test('test get settings', async () => {
    const settings = await getSettings();

    expect(settings).toBe('VALUE');
    expect(apiRequest.execute).toBeCalledTimes(1);
    expect(apiRoot.get).toBeCalledTimes(1);
  });
  test('test get cached access token', async () => {
    apiRequest.execute = jest.fn(() => ({
      body: {
        value: {
          accessToken:
            'A21AAKRK-ACvRmtR9xofN-KiTpprBzvE4x8V0lcVAylYv1KKglxbWrg8jOVSkrwflEg_61ZgeoCU-AliYAfMlzcyB72h3vXDg',
          validUntil: '2023-11-29T04:14:29.323Z',
        },
      },
    }));
    const cachedToken = await getCachedAccessToken();

    expect(cachedToken?.value).toHaveProperty('accessToken');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });
  test('test cacheAccessToken', async () => {
    await cacheAccessToken({ accessToken: '123', validUntil: new Date() }, 1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });
});
