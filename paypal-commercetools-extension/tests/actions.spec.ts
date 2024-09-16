import { describe, expect } from '@jest/globals';
import {
  createCustomCustomerType,
  createCustomerUpdateExtension,
  createCustomPaymentInteractionType,
  createCustomPaymentType,
  createPaymentUpdateExtension,
  deleteExtension,
  PAYPAL_API_CUSTOMER_ENDPOINTS,
  PAYPAL_API_PAYMENT_ENDPOINTS,
  PAYPAL_PAYMENT_EXTENSION_KEY,
} from '../src/connector/actions';

describe('Testing actions', () => {
  test.each([
    {
      method: createCustomerUpdateExtension,
    },
    {
      method: createPaymentUpdateExtension,
    },
  ])('$method', async ({ method }) => {
    const apiRequest: any = {
      execute: jest.fn(() => ({ body: { results: [{}] } })),
    };
    const apiRoot: any = {
      extensions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
      post: jest.fn(() => apiRequest),
    };
    await method(apiRoot, 'https://lorem.ipsum');
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
              key: PAYPAL_PAYMENT_EXTENSION_KEY,
              destination: {
                type: 'HTTP',
                url: 'https://lorem.ipsum',
              },
            },
          ],
        },
      })),
    };
    const apiRoot: any = {
      extensions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteExtension(
      apiRoot,
      PAYPAL_PAYMENT_EXTENSION_KEY,
      'https://lorem.ipsum'
    );
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });

  test.each([
    {
      method: createCustomPaymentType,
      key: 'paypal-payment-type',
      expectedLength: PAYPAL_API_PAYMENT_ENDPOINTS.length * 2 + 1,
    },
    {
      method: createCustomCustomerType,
      key: 'paypal-customer-type',
      expectedLength: PAYPAL_API_CUSTOMER_ENDPOINTS.length * 2 + 1,
    },
    {
      method: createCustomPaymentInteractionType,
      key: 'paypal-payment-interaction-type',
      expectedLength: 3,
    },
  ])('$method', async ({ method, key, expectedLength }) => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: { results: [{ key, fieldDefinitions: [] }] },
      })),
    };
    const apiRoot: any = {
      types: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      post: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await method(apiRoot);
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
    expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(
      expectedLength
    );
  });
});
