import { PaymentReference } from '@commercetools/platform-sdk';
import { describe, expect, test } from '@jest/globals';
import { randomUUID } from 'crypto';
import validator from 'validator';
import { Capture, Order, Refund } from '../src/paypal/checkout_api';
import { PayPalSettings, UpdateActions } from '../src/types/index.types';
import { logger } from '../src/utils/logger.utils';

let configMock: any;

const paymentInStoreTestId = 'store1Key';

const mockConfigModule = () => {
  jest.mock('../src/service/commercetools.service', () => ({
    getCart: jest.fn((mockPaymentId: string) => {
      return {
        locale: 'en',
        lineItems: discountedLineItems,
        ...prices,
        discountOnTotalPrice,
        store: mockPaymentId.startsWith(paymentInStoreTestId)
          ? { key: paymentInStoreTestId }
          : undefined,
        billingAddress: {
          postalCode: '12345',
          country: 'DE',
          firstName: 'First',
          lastName: 'Last',
        },
        customerEmail: 'email@for.invoice',
      };
    }),
    getPayPalUserId: jest.fn(),
  }));
  configMock = {
    getSettings: jest.fn(
      () =>
        ({
          payPalIntent: 'Authorize',
        } as PayPalSettings)
    ),
    getCachedAccessToken: jest.fn(),
    cacheAccessToken: jest.fn(),
  };
  jest.mock('../src/service/config.service', () => configMock);
};
mockConfigModule();

import { paymentController } from '../src/controllers/payments.controller';
import {
  discountedLineItems,
  discountedLineitemWithTaxIncluded,
  discountOnTotalPrice,
  prices,
} from './constants';
import { getCart } from '../src/service/commercetools.service';
import { Resource } from '../src/interfaces/resource.interface';

const setPaymentStoreKey = (paymentRequestObj: any) =>
  (paymentRequestObj.id = `${paymentInStoreTestId}${paymentRequestObj.id.slice(
    paymentInStoreTestId.length
  )}`);

const amountPlanned = {
  centAmount: 8200,
  fractionDigits: 2,
  currencyCode: 'EUR',
};

const payment_source = {
  card: {
    number: 4005519200000004,
    expiry: '2030-12',
    security_code: '123',
  },
};

const customFieldCreateOrder = {
  custom: {
    fields: {
      createPayPalOrderRequest: '{}',
    },
  },
};

const expectClientTokenRequest = async (paymentRequest: Resource) => {
  const paymentResponse = await paymentController('Update', paymentRequest);
  expect(paymentResponse).toBeDefined();
  expect(paymentResponse).toHaveProperty('statusCode', 200);
  const getClientTokenResponse = paymentResponse?.actions.find(
    (action) => action.name === 'getClientTokenResponse'
  );
  expect(getClientTokenResponse).toBeDefined();
  expect(getClientTokenResponse?.name).toBe('getClientTokenResponse');
  const token = getClientTokenResponse?.value;
  expect(validator.isBase64(token)).toBeTruthy();
  const data = JSON.parse(Buffer.from(token, 'base64').toString());
  expect(data).toBeDefined();
  expect(data).toHaveProperty('braintree');
  expect(data).toHaveProperty('paypal');
};

describe('Testing Braintree GetClient Token', () => {
  test('create client token for default PayPal credentials', async () => {
    const paymentRequest = {
      obj: {
        custom: {
          fields: {
            getClientTokenRequest: '{}',
          },
        },
      },
    } as unknown as PaymentReference;
    await expectClientTokenRequest(paymentRequest);
  }, 20000);
  test('create client token for custom store', async () => {
    const paymentRequest = {
      obj: {
        custom: {
          fields: {
            getClientTokenRequest: '{}',
            storeKey: paymentInStoreTestId,
          },
        },
      },
    } as unknown as PaymentReference;
    await expectClientTokenRequest(paymentRequest);
  }, 20000);
});

function expectSuccessfulResponse(
  paymentResponse:
    | {
        actions: UpdateActions;
        statusCode: number;
      }
    | undefined,
  responseField = 'createPayPalOrderResponse'
): Order | Refund | Capture {
  expect(paymentResponse).toBeDefined();
  expect(paymentResponse).toHaveProperty('statusCode', 200);
  const transactionSaleResponse = paymentResponse?.actions.find(
    (action) => action.name === responseField
  );
  expect(transactionSaleResponse).toBeDefined();
  return JSON.parse(transactionSaleResponse?.value);
}

describe('create order with various configurations', () =>
  test.each(
    [
      [
        {
          storeInVaultOnSuccess: false,
          intent: 'AUTHORIZE',
          custom_invoice_id: 'custom_invoice_id',
          paymentSource: { card: {} },
        },
        'card with authorize and custom invoice id',
      ],
      [
        {
          storeInVaultOnSuccess: true,
          intent: 'CAPTURE',
          paymentSource: { card: {} },
        },
        'card with capture and store in vault',
      ],
      [
        {
          storeInVaultOnSuccess: true,
          intent: 'CAPTURE',
          paymentSource: {
            paypal: {
              experience_context: {
                return_url: 'https://example.com/returnUrl',
                cancel_url: 'https://example.com/cancelUrl',
              },
            },
          },
        },
        'PayPal',
      ],
    ]
      .map((payment) => [
        [...payment, false],
        [...payment, true],
      ])
      .flat()
  )(
    'given valid create order data %p, which is %p, and related to store %p results in order creation',
    async (createOrderData: any, description, inStore = false) => {
      const paymentRequest = {
        obj: {
          amountPlanned: {
            ...amountPlanned,
            centAmount: amountPlanned.centAmount,
          },
          custom: {
            fields: {
              createPayPalOrderRequest: JSON.stringify(createOrderData),
            },
          },
          id: randomUUID(),
        },
      } as any;
      inStore && setPaymentStoreKey(paymentRequest.obj);

      let paymentResponse = await paymentController('Update', paymentRequest);
      let payPalOrder = expectSuccessfulResponse(paymentResponse);
      if (createOrderData.paymentSource.card)
        expect(payPalOrder).toHaveProperty('status', 'CREATED');
      else
        expect(payPalOrder).toHaveProperty('status', 'PAYER_ACTION_REQUIRED');
      if (createOrderData.intent === 'CAPTURE')
        expect(payPalOrder.links?.some((link) => link.rel === 'capture'));
      else expect(payPalOrder.links?.some((link) => link.rel === 'authorize'));
    }
  ));

test('create Pay Upon Invoice order is not possible without device data', async () => {
  const paymentRequest = {
    obj: {
      amountPlanned: {
        ...amountPlanned,
        centAmount: amountPlanned.centAmount,
      },
      custom: {
        fields: {
          createPayPalOrderRequest: JSON.stringify({
            clientMetadataId: '7b1fedd4-1fb4-4c6d-aacc-1f3e5f3c',
            paymentSource: {
              pay_upon_invoice: {
                birth_date: '1990-01-01',
                phone: { national_number: '6912345678', country_code: '49' },
              },
            },
          }),
        },
      },
      id: randomUUID(),
    },
  };
  try {
    await paymentController('Update', paymentRequest);
  } catch (error) {
    if (error instanceof Error)
      expect(error.message).toContain('DEVICE_DATA_NOT_AVAILABLE');
  }
});

async function createValidTransaction(customAmount?: number, inStore = false) {
  const customInvoiceId = randomUUID();
  const paymentRequest = {
    obj: {
      amountPlanned: {
        ...amountPlanned,
        centAmount: customAmount || amountPlanned.centAmount,
      },
      custom: {
        fields: {
          createPayPalOrderRequest: JSON.stringify({
            custom_invoice_id: customInvoiceId,
          }),
        },
      },
      id: randomUUID(),
    },
  } as any;
  inStore && setPaymentStoreKey(paymentRequest.obj);

  let paymentResponse = await paymentController('Update', paymentRequest);
  let payPalOrder = expectSuccessfulResponse(paymentResponse);
  expect(payPalOrder).toHaveProperty('status', 'CREATED');
  return { paymentRequest, payPalOrder, customInvoiceId };
}

async function completeValidOrder(
  customAmount?: number,
  customStringAmount?: string,
  inStore?: boolean
) {
  let { paymentRequest, payPalOrder, customInvoiceId } =
    await createValidTransaction(customAmount, inStore);

  paymentRequest.obj = {
    ...paymentRequest.obj,
    interfaceId: payPalOrder.id,
    custom: {
      fields: {
        authorizePayPalOrderRequest: JSON.stringify({
          payment_source,
        }),
        PayPalOrderId: payPalOrder.id,
        storeKey: inStore ? paymentInStoreTestId : undefined,
      },
    },
  };

  let paymentResponse = await paymentController('Update', paymentRequest);
  payPalOrder = expectSuccessfulResponse(
    paymentResponse,
    'authorizePayPalOrderResponse'
  ) as Order;
  expect(payPalOrder).toHaveProperty('status', 'COMPLETED');
  expect(payPalOrder.purchase_units).toHaveLength(1);
  if (!payPalOrder.purchase_units) {
    return;
  }
  expect(payPalOrder.purchase_units[0]?.payments?.authorizations).toHaveLength(
    1
  );
  if (!payPalOrder.purchase_units[0]?.payments?.authorizations) {
    return;
  }
  let authorization =
    payPalOrder.purchase_units[0]?.payments?.authorizations[0];
  expect(authorization?.amount?.value).toBe(customStringAmount ?? '82.00');
  expect(authorization?.invoice_id).toBe(customInvoiceId);
  expect(authorization?.status).toBe('CREATED');

  // GET ORDER REQUEST

  paymentRequest.obj = {
    ...paymentRequest.obj,
    custom: {
      fields: {
        getPayPalOrderRequest: '{}',
        PayPalOrderId: payPalOrder.id,
        storeKey: inStore ? paymentInStoreTestId : undefined,
      },
    },
  };
  paymentResponse = await paymentController('Update', paymentRequest);
  payPalOrder = expectSuccessfulResponse(
    paymentResponse,
    'getPayPalOrderResponse'
  ) as Order;
  expect(payPalOrder).toHaveProperty('status', 'COMPLETED');
  expect(payPalOrder.purchase_units).toHaveLength(1);
  if (!payPalOrder.purchase_units) {
    return;
  }
  expect(payPalOrder.purchase_units[0]?.payments?.authorizations).toHaveLength(
    1
  );
  if (!payPalOrder.purchase_units[0]?.payments?.authorizations) {
    return;
  }
  authorization = payPalOrder.purchase_units[0]?.payments?.authorizations[0];
  expect(authorization?.amount?.value).toBe(customStringAmount ?? '82.00');
  expect(authorization?.status).toBe('CREATED');

  paymentRequest.obj = {
    ...paymentRequest.obj,
    transactions: [
      {
        type: 'Authorization',
        interactionId: authorization?.id,
        state: 'Success',
      },
    ],
  };
  return { paymentRequest, payPalOrderId: payPalOrder.id };
}

const cartPaymentAmount = prices.totalPrice.centAmount;
const paymentAmounts = [
  cartPaymentAmount,
  cartPaymentAmount * 2,
  cartPaymentAmount - 1,
];

const ctAmountString = (amount: number) => {
  const stringAmount = amount.toString();
  return `${stringAmount.slice(0, -2)}.${stringAmount.slice(-2)}`;
};

const amountPlannedCentsWithTestResult = paymentAmounts
  .map((item) => [
    item,
    item === paymentAmounts[0]
      ? 'same as'
      : item > paymentAmounts[0]
      ? 'more than'
      : 'less than',
    ctAmountString(item),
  ])
  .map((item) => [
    [...item, false],
    [...item, true],
  ])
  .flat() as [number, string, string, boolean][];

describe('Testing PayPal aftersales', () => {
  test.each(amountPlannedCentsWithTestResult)(
    'Create a valid transaction with %p cents, which is %p cart , leads to processing transaction with %p amount',
    async (amountPlannedCents, description, expectedAmount, inStore) => {
      const relevantTransactionData = await completeValidOrder(
        amountPlannedCents,
        expectedAmount,
        inStore
      );
      if (!relevantTransactionData) return;
      const { paymentRequest, payPalOrderId } = relevantTransactionData;
      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            capturePayPalAuthorizationRequest: '{}',
            PayPalOrderId: payPalOrderId,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      const paymentResponse = await paymentController('Update', paymentRequest);
      const payPalCapture = expectSuccessfulResponse(
        paymentResponse,
        'capturePayPalAuthorizationResponse'
      ) as Capture;
      expect(payPalCapture).toHaveProperty('status', 'COMPLETED');
      expect(payPalCapture.amount?.value).toBe(expectedAmount);
    },
    30000
  );

  test.each([false, true])(
    `update paypal order, which is in store %p`,
    async (inStore) => {
      const { paymentRequest, payPalOrder } = await createValidTransaction(
        19400,
        inStore
      );
      (getCart as jest.Mock).mockReturnValueOnce({
        lineItems: [discountedLineitemWithTaxIncluded],
      });
      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            updatePayPalOrderRequest: '{}',
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
            patch: [
              {
                op: 'replace',
                path: "/purchase_units/@reference_id=='default'/amount",
                value: { currency_code: 'EUR', value: '130.00' },
              },
            ],
          },
        },
      };
      const paymentResponse = await paymentController('Update', paymentRequest);
      const response = expectSuccessfulResponse(
        paymentResponse,
        'updatePayPalOrderRequest'
      );
      expect(response).toBe(null);
    },
    30000
  );

  test.each([false, true])(
    'Settle an authorization, which is in store %p',
    async (inStore) => {
      const relevantTransactionData = await completeValidOrder(
        undefined,
        undefined,
        inStore
      );
      if (!relevantTransactionData) return;
      const { paymentRequest, payPalOrderId } = relevantTransactionData;

      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            capturePayPalAuthorizationRequest: '{}',
            PayPalOrderId: payPalOrderId,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      const paymentResponse = await paymentController('Update', paymentRequest);
      const payPalCapture = expectSuccessfulResponse(
        paymentResponse,
        'capturePayPalAuthorizationResponse'
      ) as Capture;
      expect(payPalCapture).toHaveProperty('status', 'COMPLETED');
      expect(payPalCapture.amount?.value).toBe('82.00');
    },
    30000
  );

  test.each([false, true])(
    'Void an authorization, which is in store %p',
    async (inStore) => {
      const relevantTransactionData = await completeValidOrder(
        undefined,
        undefined,
        inStore
      );
      if (!relevantTransactionData) return;
      const { paymentRequest, payPalOrderId } = relevantTransactionData;

      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            voidPayPalAuthorizationRequest: '{}',
            PayPalOrderId: payPalOrderId,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      const paymentResponse = await paymentController('Update', paymentRequest);
      const payPalCapture = expectSuccessfulResponse(
        paymentResponse,
        'voidPayPalAuthorizationResponse'
      ) as Capture;
      expect(payPalCapture).toHaveProperty('status', 'VOIDED');
      expect(payPalCapture.amount?.value).toBe('82.00');
    },
    30000
  );

  test.each([false, true])(
    'Refund a settlement, which is in store %p',
    async (inStore) => {
      configMock.getSettings = jest.fn(
        () =>
          ({
            payPalIntent: 'Capture',
          } as PayPalSettings)
      );
      const paymentRequest = {
        obj: {
          amountPlanned,
          ...customFieldCreateOrder,
          id: randomUUID(),
        },
      } as any;
      inStore && setPaymentStoreKey(paymentRequest.obj);

      let paymentResponse = await paymentController('Update', paymentRequest);
      let payPalOrder = expectSuccessfulResponse(paymentResponse);
      expect(payPalOrder).toHaveProperty('status', 'CREATED');
      paymentRequest.obj = {
        ...paymentRequest.obj,
        interfaceId: payPalOrder.id,
        custom: {
          fields: {
            capturePayPalOrderRequest: JSON.stringify({
              payment_source,
            }),
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      paymentResponse = await paymentController('Update', paymentRequest);
      payPalOrder = expectSuccessfulResponse(
        paymentResponse,
        'capturePayPalOrderResponse'
      ) as Order;
      logger.info(JSON.stringify(payPalOrder));
      expect(payPalOrder).toHaveProperty('status', 'COMPLETED');
      expect(payPalOrder.purchase_units).toHaveLength(1);
      if (!payPalOrder.purchase_units) {
        return;
      }
      expect(payPalOrder.purchase_units[0]?.payments?.captures).toHaveLength(1);
      if (!payPalOrder.purchase_units[0]?.payments?.captures) {
        return;
      }
      const capture = payPalOrder.purchase_units[0]?.payments?.captures[0];
      expect(capture?.amount?.value).toBe('82.00');
      expect(capture?.status).toBe('COMPLETED');
      expect(capture?.invoice_id).toBe(paymentRequest.obj.id);

      // GET ORDER REQUEST

      paymentRequest.obj = {
        ...paymentRequest.obj,
        transactions: [
          {
            type: 'Charge',
            interactionId: capture?.id,
            state: 'Success',
          },
        ],
        custom: {
          fields: {
            getPayPalCaptureRequest: '{}',
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      paymentResponse = await paymentController('Update', paymentRequest);
      const payPalCapture = expectSuccessfulResponse(
        paymentResponse,
        'getPayPalCaptureResponse'
      ) as Capture;
      logger.info(JSON.stringify(payPalCapture));
      expect(payPalCapture).toHaveProperty('status', 'COMPLETED');
      expect(payPalCapture.amount?.value).toBe('82.00');
      expect(payPalCapture?.invoice_id).toBe(paymentRequest.obj.id);

      // REFUND

      paymentRequest.obj = {
        ...paymentRequest.obj,
        transactions: [
          {
            type: 'Charge',
            interactionId: payPalCapture.id,
            state: 'Success',
          },
        ],
        custom: {
          fields: {
            refundPayPalOrderRequest: '{"amount": 2}',
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      paymentResponse = await paymentController('Update', paymentRequest);
      payPalOrder = expectSuccessfulResponse(
        paymentResponse,
        'refundPayPalOrderResponse'
      ) as Refund;
      logger.info(JSON.stringify(payPalOrder));
      expect(payPalOrder).toHaveProperty('status', 'COMPLETED');
      expect(payPalOrder?.amount?.value).toBe('2.00');
    },
    30000
  );

  test.each([false, true])(
    'tracking information, which is in store %p',
    async (inStore) => {
      configMock.getSettings = jest.fn(
        () =>
          ({
            payPalIntent: 'Capture',
          } as PayPalSettings)
      );
      const paymentRequest = {
        obj: {
          amountPlanned,
          ...customFieldCreateOrder,
          id: randomUUID(),
        },
      } as any;
      inStore && setPaymentStoreKey(paymentRequest.obj);

      let paymentResponse = await paymentController('Update', paymentRequest);
      let payPalOrder = expectSuccessfulResponse(paymentResponse);
      expect(payPalOrder).toHaveProperty('status', 'CREATED');
      paymentRequest.obj = {
        ...paymentRequest.obj,
        interfaceId: payPalOrder.id,
        custom: {
          fields: {
            capturePayPalOrderRequest: JSON.stringify({
              payment_source,
            }),
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      paymentResponse = await paymentController('Update', paymentRequest);
      payPalOrder = expectSuccessfulResponse(
        paymentResponse,
        'capturePayPalOrderResponse'
      ) as Order;
      expect(payPalOrder).toHaveProperty('status', 'COMPLETED');
      if (!payPalOrder.purchase_units) {
        return;
      }
      if (!payPalOrder.purchase_units[0]?.payments?.captures) {
        return;
      }
      const capture = payPalOrder.purchase_units[0]?.payments?.captures[0];

      // CREATE TRACKING INFORMATION

      paymentRequest.obj = {
        ...paymentRequest.obj,
        transactions: [
          {
            type: 'Charge',
            interactionId: capture?.id,
            state: 'Success',
          },
        ],
        custom: {
          fields: {
            createTrackingInformationRequest: JSON.stringify({
              tracking_number: 'ABCDE',
              carrier: 'OTHER',
              carrier_name_other: 'New Carrier',
            }),
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };

      paymentResponse = await paymentController('Update', paymentRequest);
      payPalOrder = expectSuccessfulResponse(
        paymentResponse,
        'createTrackingInformationResponse'
      ) as Order;
      logger.info(JSON.stringify(payPalOrder));
      if (!payPalOrder.purchase_units) {
        return;
      }
      if (!payPalOrder.purchase_units[0].shipping?.trackers) {
        return;
      }
      expect(payPalOrder.purchase_units[0].shipping.trackers).toHaveLength(1);

      expect(
        payPalOrder.purchase_units[0].shipping.trackers[0].id
      ).toBeDefined();

      expect(
        payPalOrder.purchase_units[0].shipping.trackers[0].update_time
      ).not.toBeDefined();

      // UPDATE TRACKING INFORMATION

      const trackerId = payPalOrder?.purchase_units[0].shipping.trackers[0].id;
      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            updateTrackingInformationRequest: JSON.stringify({
              trackingId: trackerId,
              patch: [{ op: 'replace', path: '/notify_payer', value: true }],
            }),
            PayPalOrderId: payPalOrder.id,
            storeKey: inStore ? paymentInStoreTestId : undefined,
          },
        },
      };
      paymentResponse = await paymentController('Update', paymentRequest);
      payPalOrder = expectSuccessfulResponse(
        paymentResponse,
        'updateTrackingInformationResponse'
      ) as Order;
      logger.info(JSON.stringify(payPalOrder));
      expect(payPalOrder.status).toBe('success');
    },
    30000
  );
});
