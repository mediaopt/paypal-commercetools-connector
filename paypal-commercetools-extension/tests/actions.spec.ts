import { describe, expect } from '@jest/globals';
import {
  addOrUpdateCustomType,
  createExtension,
  deleteExtension,
  deleteOrUpdateCustomType,
  ExtensionKey,
  PayPalCustomTypeKeys,
} from '../src/connector/actions';
import {
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PAYMENT_TYPE_KEY,
} from '../src/constants';

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

const extensionResources: ExtensionKey[] = [
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_CUSTOMER_EXTENSION_KEY,
];

const typesWithExpectedResults: {
  key: PayPalCustomTypeKeys;
  expectedLength: number;
}[] = [
  {
    key: PAYPAL_PAYMENT_TYPE_KEY,
    expectedLength: 26, //PAYPAL_API_PAYMENT_ENDPOINTSx2+2
  },
  {
    key: PAYPAL_CUSTOMER_TYPE_KEY,
    expectedLength: 11, //PAYPAL_API_CUSTOMER_ENDPOINTSx2+1
  },
  {
    key: PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
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
    async ({ key, expectedLength }) => {
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
      await addOrUpdateCustomType(apiRoot, key);
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
    await deleteOrUpdateCustomType(apiRoot, PAYPAL_PAYMENT_TYPE_KEY);
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
    await deleteOrUpdateCustomType(
      apiRoot,
      PAYPAL_PAYMENT_INTERACTION_TYPE_KEY
    );
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
    await deleteOrUpdateCustomType(
      apiRoot,
      PAYPAL_PAYMENT_INTERACTION_TYPE_KEY
    );
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });
});
