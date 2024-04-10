import { PaymentReference } from '@commercetools/platform-sdk';
import { describe, expect, test } from '@jest/globals';
import validator from 'validator';
import { Capture, Order, Refund } from '../src/paypal/checkout_api';
import { PayPalSettings, UpdateActions } from '../src/types/index.types';
import { logger } from '../src/utils/logger.utils';
import isBase64 = validator.isBase64;
let configMock: any;

const currencyData = {
  type: 'centPrecision',
  currencyCode: 'EUR',
  fractionDigits: 2,
};

const taxedPrice = {
  totalNet: {
    ...currencyData,
    centAmount: 6891,
  },
  totalGross: {
    ...currencyData,
    centAmount: 8200,
  },
  totalTax: {
    ...currencyData,
    centAmount: 1309,
  },
};

const prices = {
  totalPrice: {
    ...currencyData,
    centAmount: 8200,
  },
  taxedPrice,
};
const mockConfigModule = () => {
  jest.mock('../src/service/commercetools.service', () => ({
    getCart: jest.fn(() => {
      return {
        locale: 'en',
        lineItems: [
          {
            name: {
              en: 'T-Shirt Maison Scotch multi 2',
              de: 'T-Shirt Maison Scotch multi',
            },
            variant: {
              id: 1,
              sku: 'M0E20000000EH4R',
              key: 'M0E20000000EH4R',
            },
            price: {
              id: 'fb35cb7a-44e8-4065-a1d0-60ff1e69420c',
              value: {
                ...currencyData,
                centAmount: 8200,
              },
              country: 'DE',
            },
            quantity: 1,
            taxRate: {
              name: '19% incl.',
              amount: 0.19,
              includedInPrice: true,
              country: 'DE',
              id: 'ztfE6U8r',
              subRates: [],
            },
            ...prices,
          },
        ],
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

describe('Testing Braintree GetClient Token', () => {
  test('create client token', async () => {
    const paymentRequest = {
      obj: {
        custom: {
          fields: {
            getClientTokenRequest: '{}',
          },
        },
      },
    } as unknown as PaymentReference;
    const paymentResponse = await paymentController('Update', paymentRequest);
    expect(paymentResponse).toBeDefined();
    expect(paymentResponse).toHaveProperty('statusCode', 200);
    const getClientTokenResponse = paymentResponse?.actions.find(
      (action) => action.name === 'getClientTokenResponse'
    );
    expect(getClientTokenResponse).toBeDefined();
    expect(getClientTokenResponse?.name).toBe('getClientTokenResponse');
    const token = getClientTokenResponse?.value;
    expect(isBase64(token)).toBeTruthy();
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(data).toBeDefined();
    expect(data).toHaveProperty('braintree');
    expect(data).toHaveProperty('paypal');
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

describe('Testing PayPal aftersales', () => {
  test('Settle an authorization', async () => {
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
    expect(
      payPalOrder.purchase_units[0]?.payments?.authorizations
    ).toHaveLength(1);
    if (!payPalOrder.purchase_units[0]?.payments?.authorizations) {
      return;
    }
    let authorization =
      payPalOrder.purchase_units[0]?.payments?.authorizations[0];
    expect(authorization?.amount?.value).toBe('82.00');
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
    expect(
      payPalOrder.purchase_units[0]?.payments?.authorizations
    ).toHaveLength(1);
    if (!payPalOrder.purchase_units[0]?.payments?.authorizations) {
      return;
    }
    authorization = payPalOrder.purchase_units[0]?.payments?.authorizations[0];
    expect(authorization?.amount?.value).toBe('82.00');
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
      custom: {
        fields: {
          capturePayPalAuthorizationRequest: '{}',
          PayPalOrderId: payPalOrder.id,
        },
      },
    };
    paymentResponse = await paymentController('Update', paymentRequest);
    const payPalCapture = expectSuccessfulResponse(
      paymentResponse,
      'capturePayPalAuthorizationResponse'
    ) as Capture;
    expect(payPalCapture).toHaveProperty('status', 'COMPLETED');
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
});
