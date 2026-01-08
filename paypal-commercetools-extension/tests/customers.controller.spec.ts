import { PaymentReference } from '@commercetools/platform-sdk';
import { describe, expect, test } from '@jest/globals';
import { PayPalSettings, UpdateActions } from '../src/types/index.types';

const dummyPayPalUserId = '12345';
const mockConfigModule = () => {
  jest.mock('../src/service/commercetools.service', () => {
    return {
      getCart: jest.fn(),
    };
  });
  const configMock = {
    getSettings: jest.fn(() => {
      return {
        payPalIntent: 'Authorize',
      } as PayPalSettings;
    }),
    getCachedAccessToken: jest.fn(),
    cacheAccessToken: jest.fn(),
  };
  jest.mock('../src/service/config.service', () => configMock);
  return configMock;
};
mockConfigModule();

import { customerController } from '../src/controllers/customers.controller';
import { longTestTimeoutMs } from './constants';

function expectSuccessfulResponse(
  customerResponse:
    | {
        actions: UpdateActions;
        statusCode: number;
      }
    | undefined,
  responseField: string
): string {
  expect(customerResponse).toBeDefined();
  expect(customerResponse).toHaveProperty('statusCode', 200);
  const transactionSaleResponse = customerResponse?.actions.find(
    (action) => action.name === responseField
  );
  expect(transactionSaleResponse).toBeDefined();
  expect(transactionSaleResponse?.name).toBe(responseField);
  return transactionSaleResponse?.value;
}

describe('Testing PayPal customer Requests', () => {
  test(
    'create client token',
    async () => {
      const customerRequest = {
        obj: {
          custom: {
            fields: {
              getUserIDTokenRequest: '{}',
            },
          },
        },
      } as unknown as PaymentReference;
      const customerResponse = await customerController(
        'Update',
        customerRequest
      );
      const token = expectSuccessfulResponse(
        customerResponse,
        'getUserIDTokenResponse'
      );
      expect(token.length).toBe(681);
    },
    longTestTimeoutMs
  );

  test(
    'getPaymentTokens without customer',
    async () => {
      const customerRequest = {
        obj: {
          custom: {
            fields: {
              getPaymentTokensRequest: '{}',
            },
          },
        },
      } as unknown as PaymentReference;
      const customerResponse = await customerController(
        'Update',
        customerRequest
      );
      const payments = JSON.parse(
        expectSuccessfulResponse(customerResponse, 'getPaymentTokensResponse')
      );
      expect(payments.success).toBe(false);
      expect(payments.details).toContain('MISSING_REQUIRED_PARAMETER');
    },
    longTestTimeoutMs
  );

  test(
    'getPaymentTokens without valid PayPal customer id',
    async () => {
      const customerRequest = {
        obj: {
          custom: {
            fields: {
              getPaymentTokensRequest: '{}',
              PayPalUserId: '12345',
            },
          },
        },
      } as unknown as PaymentReference;
      const customerResponse = await customerController(
        'Update',
        customerRequest
      );
      const payments = JSON.parse(
        expectSuccessfulResponse(customerResponse, 'getPaymentTokensResponse')
      );
      expect(payments.success).toBe(false);
      expect(payments.details).toContain('CUSTOMER_ID_NOT_FOUND');
    },
    longTestTimeoutMs
  );

  test(
    'create vault setup token',
    async () => {
      const customerRequest = {
        obj: {
          custom: {
            fields: {
              createVaultSetupTokenRequest: JSON.stringify({
                payment_source: { card: {} },
              }),
              PayPalUserId: dummyPayPalUserId,
            },
          },
        },
      } as unknown as PaymentReference;
      const customerResponse = await customerController(
        'Update',
        customerRequest
      );
      const setupToken = JSON.parse(
        expectSuccessfulResponse(
          customerResponse,
          'createVaultSetupTokenResponse'
        )
      );
      expect(setupToken.id).toBeDefined();
      expect(setupToken.status).toBe('CREATED');
    },
    longTestTimeoutMs
  );

  test(
    'create payment token',
    async () => {
      const customerRequest = {
        obj: {
          custom: {
            fields: {
              createPaymentTokenRequest: '4G4976650J0948357',
            },
          },
        },
      };
      const customerResponse = await customerController(
        'Update',
        customerRequest
      );
      expectSuccessfulResponse(customerResponse, 'createPaymentTokenRequest');
      const paymentResponse = customerResponse?.actions?.find(
        (item) => (item.name = 'createPaymentTokenResponse')
      );
      expect(paymentResponse).toBeDefined();
      expect(paymentResponse?.value).toContain('TOKEN_NOT_FOUND');
    },
    longTestTimeoutMs
  );
});
