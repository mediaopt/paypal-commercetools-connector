import { describe, expect } from '@jest/globals';
import {
  createParcelAddedToDeliverySubscription,
  deleteAccessTokenIfExists,
  deleteParcelAddedToDeliverySubscription,
} from '../src/connector/actions';
import {
  getCachedAccessToken,
  deleteAccessToken,
} from '../src/service/config.service';

describe('Testing actions', () => {
  test('add extension', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              destination: {
                type: 'GoogleCloudPubSub',
                topic: 'old lorem ipsum',
                projectId: 'old lorem ipsum',
              },
            },
          ],
        },
      })),
    };
    const apiRoot: any = {
      subscriptions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
      post: jest.fn(() => apiRequest),
    };
    await createParcelAddedToDeliverySubscription(
      apiRoot,
      'lorem ipsum',
      'lorem ipsum'
    );
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(3);
  });

  test('delete extension', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              destination: {
                type: 'GoogleCloudPubSub',
                topic: 'topic',
                projectId: 'projectId',
              },
            },
          ],
        },
      })),
    };
    const apiRoot: any = {
      subscriptions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteParcelAddedToDeliverySubscription(
      apiRoot,
      'topic',
      'projectId'
    );
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });
});

const mockDeleteTokentTests: [string | undefined, number, number][] = [
  [undefined, 1, 1],
  ['store1', 1, 1],
  ['store2', 1, 0],
];

jest.mock('../src/service/config.service', () => ({
  getCachedAccessToken: jest.fn((storeKey?: string) =>
    Promise.resolve(storeKey !== 'store2')
  ),
  deleteAccessToken: jest.fn(),
}));
describe('testing delete token', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  test.each(mockDeleteTokentTests)(
    'delete token for a store key %s, getCachedAccessToken return is truthy if the key is not store2 , results in calls to getCachedToken %s times and delete assess token %s times ',
    async (storeKey, timesGetToken, timesDeleteToken) => {
      await deleteAccessTokenIfExists(storeKey);
      if (storeKey) expect(getCachedAccessToken).toBeCalledWith(storeKey);
      expect(getCachedAccessToken).toBeCalledTimes(timesGetToken);
      expect(deleteAccessToken).toBeCalledTimes(timesDeleteToken);
    }
  );
});
