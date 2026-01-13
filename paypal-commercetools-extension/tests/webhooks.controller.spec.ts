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
    orders: jest.fn(() => apiRoot),
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
      payment_source: { pay_upon_invoice: {} },
    }),
  }));
  return apiRoot;
};
mockConfigModule();

const responseUtilsActual = jest.requireActual('../src/utils/response.utils');
const spyOnSleep = jest.spyOn(responseUtilsActual, 'sleep');

import { logger } from '../src/utils/logger.utils';
jest.mock('../src/utils/logger.utils', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

jest.mock('../src/service/mail.service', () => ({ sendEmail: jest.fn() }));

import { post } from '../src/controllers/webhook.controller';
import { longTestTimeoutMs } from './constants';
import { Capture2StatusEnum } from '../src/paypal/payments_api';
import { sendEmail } from '../src/service/mail.service';

const mockAutrhorizedPayment = {
  id: 1,
  transactions: [
    {
      type: 'Charge',
      interactionId: 1,
      state: 'Success',
    },
  ],
  paymentStatus: {
    interfaceCode: 'APPROVED',
    interfaceText: 'APPROVED',
  },
  paymentMethodInfo: {
    method: 'pay_upon_invoice',
  },
};

const mockPaymentBody = {
  body: {
    results: [mockAutrhorizedPayment],
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

const response = {
  status: jest.fn(() => response),
  json: jest.fn(),
} as unknown as Response;

const expectSuccessfulResponse = async (
  request: any,
  executeCalls: number,
  expectedActions: string[]
) => {
  await post(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(200);
  expect(apiRequest.execute).toHaveBeenCalledTimes(executeCalls);
  const actions = apiRoot.post.mock.calls[0][0].body.actions;
  expect(actions).toHaveLength(expectedActions.length);
  expectedActions.forEach((expectedAction, index) =>
    expect(actions[index].action).toEqual(expectedAction)
  );
};

const expectedUpdatePaymentActions = [
  'setStatusInterfaceCode',
  'setStatusInterfaceText',
  'setMethodInfoMethod',
];
describe('Testing webhook controller success scenarios', () => {
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
      name: 'capture with existing transaction (update transaction state)',
      resource_type: 'capture',
      resource: { id: 1 },
      actions: ['changeTransactionState', ...expectedUpdatePaymentActions],
      executeCalls: 2,
    },
    {
      name: 'payment_token',
      resource_type: 'payment_token',
      resource: { id: 1, customer: { id: 123 }, metadata: { order_id: 2 } },
      actions: ['setCustomType'],
      executeCalls: 4,
    },
    {
      name: 'checkout order with authorization',
      resource_type: 'checkout-order',
      resource: { id: 1, intent: CheckoutPaymentIntent.Authorize },
      actions: expectedUpdatePaymentActions,
      executeCalls: 2,
      actionsCount: 3,
    },
    {
      name: 'authorization with missing transaction (create new transaction)',
      resource_type: 'authorization',
      resource: { id: 1 },
      actions: ['addTransaction', ...expectedUpdatePaymentActions],
      executeCalls: 2,
    },
  ])(
    '$name',
    async ({ actions, resource, resource_type, executeCalls }) => {
      const request = {
        header: jest.fn(),
        body: {
          resource_type,
          event_type: 'Captured',
          resource,
          summary: 'Capture is done.',
        },
      } as any;
      await expectSuccessfulResponse(request, executeCalls, actions);
    },
    longTestTimeoutMs
  );
});

const mockTokenRequest = {
  header: jest.fn(),
  body: {
    resource_type: 'payment_token',
    resource: {
      customer: { id: 'customer_id' },
      metadata: { order_id: 'order_id' },
    },
  },
} as any;

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
      expect(spyOnSleep).not.toHaveBeenCalled();
      await expectSuccessfulResponse(mockTokenRequest, 5, ['setCustomType']);
      expect(spyOnSleep).toHaveBeenCalledTimes(1);
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
      expect(spyOnSleep).not.toHaveBeenCalled();
      await post(mockTokenRequest, response);
      expect(spyOnSleep).toHaveBeenCalled();
      expect(apiRoot.post).not.toHaveBeenCalled();
    },
    longTestTimeoutMs
  );
});

describe('transaction is already up to date and payment method is not Pay Upon invoice', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce({
          body: {
            results: [
              {
                ...mockAutrhorizedPayment,
                paymentStatus: {
                  interfaceCode: 'COMPLETED',
                  interfaceText: 'COMPLETED',
                },
              },
            ],
          },
        })
        .mockReturnValueOnce(mockCartBody),
    };
    jest.clearAllMocks();
  });
  test(
    '',
    async () => {
      const request = {
        header: jest.fn(),
        body: {
          resource_type: 'capture',
          event_type: 'Captured',
          resource: { id: 1, status: Capture2StatusEnum.Completed },
          summary: 'Capture is done.',
        },
      } as any;
      await post(request, response);
      expect(spyOnSleep).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenLastCalledWith(
        'Payment 1 and transaction 1 already up do date. No action required in scope of CapturePayPalOrderWebhook'
      );
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
    expect(spyOnSleep).not.toHaveBeenCalled();
    await post(mockTokenRequest, response);
    expect(spyOnSleep).not.toHaveBeenCalled();
    expect(apiRoot.post).not.toHaveBeenCalled();
  });
});

describe('payment not found for the PayPal order', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest.fn().mockReturnValueOnce({ body: { results: [] } }),
    };
  });
  test('no related payment', async () => {
    expect(logger.error).not.toHaveBeenCalled();
    await post(mockTokenRequest, response);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenLastCalledWith(
      `PayPalPaymentTokenWebhook action impossible - there is not any assigned commercetools payment for the PayPal order id order_id`
    );
  });
});

describe('Pay upon invoice capture', () => {
  beforeEach(() => {
    apiRequest = {
      execute: jest
        .fn()
        .mockReturnValueOnce({
          body: {
            results: [mockAutrhorizedPayment],
          },
        })
        .mockReturnValue({ body: { total: 1, results: [{}] } }),
    };
    jest.clearAllMocks();
  });
  test(
    '',
    async () => {
      const request = {
        header: jest.fn(),
        body: {
          resource_type: 'capture',
          event_type: 'PAYMENT.CAPTURE.COMPLETED',
          resource: {
            id: 1,
            status: Capture2StatusEnum.Completed,
          },
          summary: 'Capture is done.',
        },
      } as any;
      await post(request, response);
      expect(spyOnSleep).not.toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledTimes(1);
    },
    longTestTimeoutMs
  );
});
