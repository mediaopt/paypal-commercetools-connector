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

import { post } from '../src/controllers/webhook.controller';
import { logger } from '../src/utils/logger.utils';

beforeEach(() => {
  apiRequest = {
    execute: jest
      .fn()
      .mockReturnValueOnce({
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
            },
          ],
        },
      })
      .mockReturnValueOnce({
        body: {
          total: 1,
          results: [
            {
              id: 1,
              customerId: 123,
            },
          ],
        },
      })
      .mockReturnValueOnce({
        body: {
          total: 1,
          results: [
            {
              id: 1,
            },
          ],
        },
      }),
  };
  jest.clearAllMocks();
});

const spy = jest.spyOn(logger, 'info');

describe('Testing webhook controller', () => {
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
      const response = {
        status: jest.fn(() => response),
        json: jest.fn(),
      } as unknown as Response;
      await post(request, response);
      expect(response.status).toBeCalledTimes(1);
      expect(response.status).toBeCalledWith(200);
      expect(apiRequest.execute).toBeCalledTimes(executeCalls);
      expect(apiRoot.post.mock.calls[0][0].body.actions).toHaveLength(
        actionsCount
      );
      expect(apiRoot.post.mock.calls[0][0].body.actions[0].action).toBe(action);
    }
  );
});

describe('test invalid webhooks scenario', () => {
  test('no resource type provided', async () => {
    const request = {
      header: jest.fn(),
      body: {
        event_type: 'Captured',
        summary: 'Capture is done.',
        resource: { id: '1' },
      },
    } as any;
    const response = {
      status: jest.fn(() => response),
      json: jest.fn(),
    } as unknown as Response;
    await post(request, response);
    expect(spy).toBeCalledTimes(5);
  });

  test('invalid resource type provided', async () => {
    const request = {
      header: jest.fn(),
      body: {
        event_type: 'Captured',
        summary: 'Capture is done.',
        resource: { id: '1' },
        resource_type: 'charcoal',
      },
    } as any;
    const response = {
      status: jest.fn(() => response),
      json: jest.fn(),
    } as unknown as Response;
    await post(request, response);
    expect(spy).toBeCalledTimes(5);
  });
});
