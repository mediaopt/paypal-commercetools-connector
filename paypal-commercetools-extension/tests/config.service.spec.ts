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

const dummyDate = new Date();

const dummyToken: AccessTokenObject = {
  accessToken:
    'A21AAKRK-ACvRmtR9xofN-KiTpprBzvE4x8V0lcVAylYv1KKglxbWrg8jOVSkrwflEg_61ZgeoCU-AliYAfMlzcyB72h3vXDg',
  validUntil: dummyDate,
};

import {
  cacheAccessToken,
  cacheAccessTokens,
  getCachedAccessToken,
  getSettings,
} from '../src/service/config.service';
import { AccessTokenObject } from '../src/types/index.types';

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
        value: dummyToken,
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
  test('test get cached access tokens for multitenant', async () => {
    apiRequest.execute = jest.fn(() => ({
      body: {
        value: [dummyToken, dummyToken],
      },
    }));
    const cachedTokens = await getCachedAccessToken(true);
    expect(cachedTokens).toBeDefined();
    expect(cachedTokens?.value.length).toBe(2);
    const tokens = cachedTokens?.value as AccessTokenObject[];
    expect(tokens[0]).toHaveProperty('accessToken');
    expect(tokens[1]).toHaveProperty('accessToken');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });
  test('test cacheAccessTokens for multitenant', async () => {
    await cacheAccessTokens([dummyToken, dummyToken], 1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });
});
