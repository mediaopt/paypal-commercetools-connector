import { PaymentReference } from '@commercetools/platform-sdk';
import { describe, expect, test } from '@jest/globals';
import { PayPalSettings, UpdateActions } from '../src/types/index.types';

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
  test('create client token', async () => {
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
  }, 20000);

  test('getPaymentTokens without customer', async () => {
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
  }, 20000);

  test('getPaymentTokens without customer', async () => {
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
  }, 20000);

  test('create vault setup token', async () => {
    const customerRequest = {
      obj: {
        custom: {
          fields: {
            createVaultSetupTokenRequest: JSON.stringify({
              payment_source: { card: {} },
            }),
            PayPalUserId: '12345',
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
  });
});
