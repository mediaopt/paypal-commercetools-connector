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

const mockDeleteTokentTests: [
  'single' | 'multi' | undefined,
  number,
  number
][] = [
  [undefined, 2, 2],
  ['single', 1, 1],
  ['multi', 1, 1],
];

jest.mock('../src/service/config.service', () => ({
  getCachedAccessToken: jest.fn(() => Promise.resolve(true)),
  deleteAccessToken: jest.fn(),
}));
describe('testing delete token', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  test.each(mockDeleteTokentTests)(
    'delete token if last tenant type is %s, getCachedAccessToken returns truthy, results in calls to getCachedToken %s times and delete assess token %s times ',
    async (lastTenantType, timesGetToken, timesDeleteToken) => {
      await deleteAccessTokenIfExists(lastTenantType);
      expect(getCachedAccessToken).toBeCalledTimes(timesGetToken);
      expect(deleteAccessToken).toBeCalledTimes(timesDeleteToken);
    }
  );
});
