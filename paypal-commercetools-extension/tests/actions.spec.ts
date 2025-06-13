import { describe, expect } from '@jest/globals';
import {
  createExtension,
  addOrUpdateCustomType,
  deleteOrUpdateCustomType,
  deleteExtension,
  ExtensionResource,
  ConnectorCustomTypes,
} from '../src/connector/actions';

const dummyApplicationUrl = 'https://lorem.ipsum';

const dummyExistingExtensionResponse = {
  body: {
    results: [
      {
        key: 'dummyExtensionKey',
        destination: {
          type: 'HTTP',
          url: dummyApplicationUrl,
        },
      },
    ],
  },
};

const extensionResources: ExtensionResource[] = ['payment', 'customer'];

const typesWithExpectedResults: {
  type: ConnectorCustomTypes;
  key: string;
  expectedLength: number;
}[] = [
  {
    type: 'payment',
    key: 'paypal-payment-type',
    expectedLength: 26, //PAYPAL_API_PAYMENT_ENDPOINTSx2+2
  },
  {
    type: 'customer',
    key: 'paypal-customer-type',
    expectedLength: 11, //PAYPAL_API_CUSTOMER_ENDPOINTSx2+1
  },
  {
    type: 'payment-interface-interaction',
    key: 'paypal-payment-interaction-type',
    expectedLength: 3,
  },
];

describe('Testing actions', () => {
  test.each(extensionResources)('createExtension for %p', async (resource) => {
    const apiRequest: any = {
      execute: jest.fn(() => dummyExistingExtensionResponse),
    };
    const apiRoot: any = {
      extensions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
      post: jest.fn(() => apiRequest),
    };
    await createExtension(apiRoot, dummyApplicationUrl, resource);
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(3);
  });

  test('delete extension', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => dummyExistingExtensionResponse),
    };
    const apiRoot: any = {
      extensions: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      delete: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteExtension(apiRoot, 'dummyExtensionKey', dummyApplicationUrl);
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });

  test.each(typesWithExpectedResults)(
    'create custom type for $type',
    async ({ type, key, expectedLength }) => {
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
      await addOrUpdateCustomType(apiRoot, type);
      expect(apiRoot.get).toBeCalledTimes(1);
      expect(apiRoot.post).toBeCalledTimes(1);
      expect(apiRequest.execute).toBeCalledTimes(2);
      expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(
        expectedLength
      );
    }
  );

  test('do not affect custom type if it has no fields matching the draft', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              key: 'noMathcingFieldsType',
              fieldDefinitions: [{ name: 'notExistingYetDefinition' }],
            },
          ],
        },
      })),
    };
    const apiRoot: any = {
      types: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      post: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteOrUpdateCustomType(apiRoot, 'payment');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(0);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });

  test('if only some fields match the type draft - delete this fields, but not the type', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              key: 'someMatchingFieldsType',
              fieldDefinitions: [
                { name: 'notExistingYetDefinition' },
                { name: 'data' },
              ],
            },
          ],
        },
      })),
    };
    const apiRoot: any = {
      types: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      post: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await deleteOrUpdateCustomType(apiRoot, 'payment-interface-interaction');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });

  test('if all fields match the type draft - delete the type', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              key: 'allMatchingFieldsType',
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
    const apiRoot: any = {
      types: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      post: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
      delete: jest.fn(() => apiRequest),
    };
    await deleteOrUpdateCustomType(apiRoot, 'payment-interface-interaction');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });
});
