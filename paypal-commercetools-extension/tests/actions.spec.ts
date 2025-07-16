import { describe, expect } from '@jest/globals';
import {
  addOrUpdateCustomType,
  createExtension,
  deleteExtension,
  deleteOrUpdateCustomType,
  ExtensionKey,
  PayPalCustomTypeKeys,
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

const extensionResources: ExtensionKey[] = [
  'paypal-payment-extension',
  'paypal-customer-extension',
];

const typesWithExpectedResults: {
  key: PayPalCustomTypeKeys;
  expectedLength: number;
}[] = [
  {
    key: 'paypal-payment-type',
    expectedLength: 26, //PAYPAL_API_PAYMENT_ENDPOINTSx2+2
  },
  {
    key: 'paypal-customer-type',
    expectedLength: 11, //PAYPAL_API_CUSTOMER_ENDPOINTSx2+1
  },
  {
    key: 'paypal-payment-interaction-type',
    expectedLength: 3,
  },
];

describe('Extension related actions', () => {
  test.each(extensionResources)(
    'createExtension for key %p',
    async (resource) => {
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
    }
  );

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
});

describe('create custom type actions', () => {
  test.each(typesWithExpectedResults)(
    'if type with $key already exists on the target resource, but the fields do not match - actions are sent to update field definitions',
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

  test('if there are multiple types on the target resource - all are updated to include missing fields, if none of the types has the same key - an extra type is created', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            { key: 'some-other-key1', fieldDefinitions: [] },
            {
              key: 'some-other-key2',
              fieldDefinitions: [{ name: 'timestamp' }],
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
    await addOrUpdateCustomType(apiRoot, 'paypal-payment-interaction-type');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(3);
    expect(apiRequest.execute).toBeCalledTimes(4);
    expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(3);
    expect(apiRoot.post.mock.calls[1][0].body.actions).toHaveLength(2);
    expect(apiRoot.post.mock.calls[2][0].body.key).toEqual(
      'paypal-payment-interaction-type'
    );
  });

  test('if there are multiple types on the target resource - all are updated to include missing fields, if one of the types has the same key - an extra type is not created', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            { key: 'some-other-key1', fieldDefinitions: [] },
            {
              key: 'paypal-payment-interaction-type',
              fieldDefinitions: [{ name: 'timestamp' }],
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
    await addOrUpdateCustomType(apiRoot, 'paypal-payment-interaction-type');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(2);
    expect(apiRequest.execute).toBeCalledTimes(3);
    expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(3);
    expect(apiRoot.post.mock.calls[1][0].body.actions).toHaveLength(2);
  });

  test('if there are no types on the target resource - an extra type is created', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [],
        },
      })),
    };
    const apiRoot: any = {
      types: jest.fn(() => apiRoot),
      withKey: jest.fn(() => apiRoot),
      post: jest.fn(() => apiRequest),
      get: jest.fn(() => apiRequest),
    };
    await addOrUpdateCustomType(apiRoot, 'paypal-payment-interaction-type');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
    expect(apiRoot.post.mock.calls[0][0].body).not.toHaveProperty('actions');
    expect(apiRoot.post.mock.calls[0][0].body.key).toEqual(
      'paypal-payment-interaction-type'
    );
  });
});

describe('delete custom type', () => {
  test('do not affect custom type if it has no fields matching the draft', async () => {
    const apiRequest: any = {
      execute: jest.fn(() => ({
        body: {
          results: [
            {
              key: 'noMatchingFieldsType',
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
    await deleteOrUpdateCustomType(apiRoot, 'paypal-payment-type');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.post).toBeCalledTimes(0);
    expect(apiRequest.execute).toBeCalledTimes(1);
  });

  test('if only some fields match the type draft - delete these fields, but not the type', async () => {
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
    await deleteOrUpdateCustomType(apiRoot, 'paypal-payment-interaction-type');
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
    await deleteOrUpdateCustomType(apiRoot, 'paypal-payment-interaction-type');
    expect(apiRoot.get).toBeCalledTimes(1);
    expect(apiRoot.delete).toBeCalledTimes(1);
    expect(apiRequest.execute).toBeCalledTimes(2);
  });
});
