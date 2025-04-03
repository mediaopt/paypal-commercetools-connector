import { PaymentReference } from '@commercetools/platform-sdk';
import { describe, expect, test } from '@jest/globals';
import { randomUUID } from 'crypto';
import validator from 'validator';
import { Capture, Order, Refund } from '../src/paypal/checkout_api';
import { PayPalSettings, UpdateActions } from '../src/types/index.types';
import { logger } from '../src/utils/logger.utils';

let configMock: any;

const paymentInStoreTestId = 'store1Key';

const currencyData = {
  type: 'centPrecision',
  currencyCode: 'EUR',
  fractionDigits: 2,
};

const taxedPrice = {
  totalNet: {
    ...currencyData,
    centAmount: 16723,
  },
  totalGross: {
    ...currencyData,
    centAmount: 19900,
  },
  totalTax: {
    ...currencyData,
    centAmount: 3177,
  },
};

const prices = {
  totalPrice: {
    ...currencyData,
    centAmount: 19900,
  },
  taxedPrice,
};
const mockConfigModule = () => {
  jest.mock('../src/service/commercetools.service', () => ({
    getCart: jest.fn((mockPaymentId: string) => {
      return mockPaymentId === paymentInStoreTestId
        ? {
            locale: 'en',
            lineItems: discountedLineItems,
            ...prices,
            store: { key: paymentInStoreTestId },
          }
        : {
            locale: 'en',
            lineItems: discountedLineItems,
            ...prices,
          };
    }),
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
import { discountedLineItems } from './constants';
import { Resource } from '../src/interfaces/resource.interface';

const amountPlanned = {
  centAmount: 8200,
  fractionDigits: 2,
  currencyCode: 'EUR',
};

const payment_source = {
  card: {
    number: 4012000033330026,
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

async function createValidTransaction(
  customAmount?: number,
  customStringAmount?: string
) {
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
  let paymentResponse = await paymentController('Update', paymentRequest);
  let payPalOrder = expectSuccessfulResponse(paymentResponse);
  expect(payPalOrder).toHaveProperty('status', 'CREATED');
  paymentRequest.obj = {
    ...paymentRequest.obj,
    interfaceId: payPalOrder.id,
    custom: {
      fields: {
        authorizePayPalOrderRequest: JSON.stringify({
          payment_source,
        }),
        PayPalOrderId: payPalOrder.id,
      },
    },
  };
  paymentResponse = await paymentController('Update', paymentRequest);
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

const amountPlannedCentsWithTestResult: [number, string, string][] = [
  [19900, 'same as cart', '199.00'],
  [200000, 'more than in cart', '2000.00'],
  [4200, 'less than in cart', '42.00'],
];

describe('Testing PayPal aftersales', () => {
  test.each(amountPlannedCentsWithTestResult)(
    'Create a valid transaction with %s cents, which is %s , leads to processing transaction with %s amount',
    async (amountPlannedCents, description, expectedAmount) => {
      const relevantTransactionData = await createValidTransaction(
        amountPlannedCents,
        expectedAmount
      );
      if (!relevantTransactionData) return;
      const { paymentRequest, payPalOrderId } = relevantTransactionData;
      paymentRequest.obj = {
        ...paymentRequest.obj,
        custom: {
          fields: {
            capturePayPalAuthorizationRequest: '{}',
            PayPalOrderId: payPalOrderId,
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

  test('Settle an authorization', async () => {
    const relevantTransactionData = await createValidTransaction();
    if (!relevantTransactionData) return;
    const { paymentRequest, payPalOrderId } = relevantTransactionData;

    paymentRequest.obj = {
      ...paymentRequest.obj,
      custom: {
        fields: {
          capturePayPalAuthorizationRequest: '{}',
          PayPalOrderId: payPalOrderId,
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
  }, 30000);

  test('Void an authorization', async () => {
    const relevantTransactionData = await createValidTransaction();
    if (!relevantTransactionData) return;
    const { paymentRequest, payPalOrderId } = relevantTransactionData;

    paymentRequest.obj = {
      ...paymentRequest.obj,
      custom: {
        fields: {
          voidPayPalAuthorizationRequest: '{}',
          PayPalOrderId: payPalOrderId,
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
  }, 30000);

  test('Refund a settlement', async () => {
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
  }, 30000);

  test('tracking information', async () => {
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
      },
    } as any;
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

    expect(payPalOrder.purchase_units[0].shipping.trackers[0].id).toBeDefined();

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
  }, 30000);
});
