import { describe, expect } from '@jest/globals';
import {
  createParcelAddedToDeliverySubscription,
  deleteParcelAddedToDeliverySubscription,
} from '../src/connector/actions';

describe('Testing actions', () => {
  test('add extension', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({ body: { results: [{}] } })),
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
      execute: jest.fn(() => ({ body: { results: [{}] } })),
    };
    const apiRoot: any = {
      subscriptions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteParcelAddedToDeliverySubscription(apiRoot);
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });
});
