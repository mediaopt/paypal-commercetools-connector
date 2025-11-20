import { describe, expect } from '@jest/globals';
import {
  createParcelAddedToDeliverySubscription,
  deleteParcelAddedToDeliverySubscription,
} from '../src/connector/actions';

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
    expect(apiRoot.get).toHaveBeenCalledTimes(1);
    expect(apiRoot.delete).toHaveBeenCalledTimes(1);
    expect(apiRoot.post).toHaveBeenCalledTimes(1);
    expect(apiRequest.execute).toHaveBeenCalledTimes(3);
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
    expect(apiRoot.get).toHaveBeenCalledTimes(1);
    expect(apiRoot.delete).toHaveBeenCalledTimes(1);
    expect(apiRequest.execute).toHaveBeenCalledTimes(2);
  });
});
