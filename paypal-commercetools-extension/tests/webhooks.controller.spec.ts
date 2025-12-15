import { describe, expect, test } from '@jest/globals';
import { Response } from 'express';
import { CheckoutPaymentIntent } from '../src/paypal/checkout_api';

let apiRequest: any = undefined;
let apiRoot: any = undefined;

const mockConfigModule = () => {
  apiRoot = {
    customObjects: jest.fn(() => apiRoot),
    payments: jest.fn(() => apiRoot),
    carts: jest.fn(() => apiRoot),
    customers: jest.fn(() => apiRoot),
    withId: jest.fn(() => apiRoot),
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
  jest.mock('../src/service/paypal.service', () => ({
    validateSignature: () => ({ verification_status: 'SUCCESS' }),
    getWebhookId: () => 1,
    getPayPalOrder: () => ({
      status: 'COMPLETED',
    }),
  }));
  return apiRoot;
};
mockConfigModule();

const actual = jest.requireActual('../src/utils/response.utils');
const spy = jest.spyOn(actual, 'sleep');

import { post } from '../src/controllers/webhook.controller';
import { longTestTimeoutMs } from './constants';

const mockPaymentBody = {
  body: {
    total: 1,
    results: [
      {
        id: 1,
        transactions: [
          {
            type: 'Charge',
            interactionId: 1,
          },
        ],
        paymentStatus: {
          interfaceCode: 'APPROVED',
          interfaceText: 'APPROVED',
        },
        paymentMethodInfo: {
          method: 'someValidPayPalCredentials',
        },
      },
    ],
  },
};

const mockCartBody = {
  body: {
    total: 1,
    results: [
      {
        id: 1,
        customerId: 123,
      },
    ],
  },
};

const mockCustomerBody = {
  body: {
    total: 1,
    results: [
      {
        id: 1,
      },
    ],
  },
};

const expectSuccessfulResponse = async (
  request: any,
  executeCalls: number,
  actionsCount: number,
  action: string
) => {
  const response = {
    status: jest.fn(() => response),
    json: jest.fn(),
  } as unknown as Response;
  await post(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(200);
  expect(apiRequest.execute).toHaveBeenCalledTimes(executeCalls);
  expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(actionsCount);
  expect(apiRoot.post.mock.calls[0][0].body.actions[0].action).toBe(action);
};
describe('Testing webhook controller', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce(mockPaymentBody)
        .mockReturnValueOnce(mockCartBody)
        .mockReturnValueOnce(mockCustomerBody),
    };
    jest.clearAllMocks();
  });

  test.each([
    {
      name: 'test capture with existing transaction',
      resource_type: 'capture',
      resource: { id: 1 },
      action: 'changeTransactionState',
      executeCalls: 2,
      actionsCount: 3,
    },
    {
      name: 'test payment_token',
      resource_type: 'payment_token',
      resource: { id: 1, customer: { id: 123 }, metadata: { order_id: 2 } },
      action: 'setCustomType',
      executeCalls: 4,
      actionsCount: 1,
    },
    {
      name: 'test order with authorization with missing transaction',
      resource_type: 'checkout-order',
      resource: { id: 1, intent: CheckoutPaymentIntent.Authorize },
      action: 'setStatusInterfaceCode',
      executeCalls: 2,
      actionsCount: 2,
    },
    {
      name: 'test authorization with missing transaction',
      resource_type: 'authorization',
      resource: { id: 1 },
      action: 'addTransaction',
      executeCalls: 2,
      actionsCount: 3,
    },
  ])(
    '$name',
    async ({ action, resource, resource_type, executeCalls, actionsCount }) => {
      const request = {
        header: jest.fn(),
        body: {
          resource_type,
          event_type: 'Captured',
          resource,
          summary: 'Capture is done.',
        },
      } as any;
      await expectSuccessfulResponse(
        request,
        executeCalls,
        actionsCount,
        action
      );
    },
    longTestTimeoutMs
  );
});

describe('test retry fetch cart', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce(mockPaymentBody)
        .mockReturnValueOnce({ body: { total: 0, results: [] } })
        .mockReturnValueOnce(mockCartBody)
        .mockReturnValueOnce(mockCustomerBody),
    };
    jest.clearAllMocks();
  });
  test(
    'refetch cart once',
    async () => {
      expect(spy).not.toHaveBeenCalled();
      const request = {
        header: jest.fn(),
        body: {
          resource_type: 'payment_token',
          resource: {
            customer: { id: 'customer_id' },
            metadata: { order_id: 'order_id' },
          },
        },
      } as any;
      await expectSuccessfulResponse(request, 5, 1, 'setCustomType');
      expect(spy).toHaveBeenCalledTimes(1);
    },
    longTestTimeoutMs
  );
});

describe('test cart could not be fetched', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce(mockPaymentBody)
        .mockReturnValue({ body: { total: 0, results: [] } }),
    };
    jest.clearAllMocks();
  });
  test(
    'refetch cart did not succeed',
    async () => {
      expect(spy).not.toHaveBeenCalled();
      const request = {
        header: jest.fn(),
        body: {
          resource_type: 'payment_token',
          resource: {
            customer: { id: 'customer_id' },
            metadata: { order_id: 'order_id' },
          },
        },
      } as any;
      const response = {
        status: jest.fn(() => response),
        json: jest.fn(),
      } as unknown as Response;
      await post(request, response);
      expect(spy).toHaveBeenCalled();
      expect(apiRoot.post).not.toHaveBeenCalled();
    },
    longTestTimeoutMs
  );
});

describe('customer not found', () => {
  const mockCartWithoutCustomer = {
    body: {
      total: 1,
      results: [
        {
          id: 1,
        },
      ],
    },
  };
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce(mockPaymentBody)
        .mockReturnValueOnce(mockCartWithoutCustomer),
    };
    jest.clearAllMocks();
  });
  test('cart fetched success but no customer associated with it', async () => {
    expect(spy).not.toHaveBeenCalled();
    const request = {
      header: jest.fn(),
      body: {
        resource_type: 'payment_token',
        resource: {
          customer: { id: 'customer_id' },
          metadata: { order_id: 'order_id' },
        },
      },
    } as any;
    const response = {
      status: jest.fn(() => response),
      json: jest.fn(),
    } as unknown as Response;
    await post(request, response);
    expect(spy).not.toHaveBeenCalled();
    expect(apiRoot.post).not.toHaveBeenCalled();
  });
});
