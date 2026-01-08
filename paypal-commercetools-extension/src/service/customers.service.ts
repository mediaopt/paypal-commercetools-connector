import { Customer } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import {
  PaymentTokenRequest,
  SetupTokenRequest,
  TokenIdRequestTypeEnum,
} from '../paypal/vault_api';
import { StringOrObject, UpdateActions } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {
  handleCustomerResponse,
  handleError,
  handleRequest,
} from '../utils/response.utils';
import {
  createPaymentToken,
  createVaultSetupToken,
  deletePaymentToken,
  generateUserIdToken,
  getPaymentTokens,
} from './paypal.service';

const skipRemoveEmptyProperties = (reqestName: string) =>
  !['getUserIDToken', 'getUserIDToken'].some((item) => item === reqestName);

async function handleCustomer<T>(
  customerId: string,
  requestName: string,
  request: T,
  handleResponse: () => Promise<{
    response: StringOrObject;
    extraActions?: UpdateActions;
  }>
) {
  const updateActions = handleRequest(
    requestName,
    request as StringOrObject,
    skipRemoveEmptyProperties(requestName),
    false
  );
  logger.info(
    `${requestName} request for customer leads to ${updateActions.length} update actions`
  );
  try {
    const { response, extraActions } = await handleResponse();
    const responseActions = handleCustomerResponse(requestName, response);

    logger.info(
      `${requestName} response success, leads to ${
        responseActions.length
      } log response actions and ${
        extraActions?.length ?? 0
      } additional actions`
    );
    return updateActions.concat(responseActions, extraActions ?? []);
  } catch (e) {
    return handleError(requestName, customerId, e, 'customer');
  }
}

export async function handleGetUserIDTokenRequest(customer: Customer) {
  const request = customer?.custom?.fields?.getUserIDTokenRequest;
  if (!request) {
    return [];
  }
  const customerId = customer?.custom?.fields?.PayPalUserId;

  const handleResponse = async () => {
    const response = await generateUserIdToken(customerId);
    return { response };
  };

  return handleCustomer<{ customerId?: string }>(
    customerId,
    'getUserIDToken',
    {
      customerId,
    },
    handleResponse
  );
}

export async function handleDeletePaymentTokenRequest(customer: Customer) {
  const paymentToken = customer?.custom?.fields?.deletePaymentTokenRequest;
  if (!paymentToken) {
    return [];
  }
  const handleResponse = async () => {
    const response = (await deletePaymentToken(paymentToken)) ?? '';
    return { response };
  };

  return handleCustomer<{ paymentToken: string }>(
    customer.id,
    'deletePaymentToken',
    { paymentToken },
    handleResponse
  );
}

export const handleCreateVaultSetupTokenRequest = async (
  customer: Customer
): Promise<UpdateAction[]> => {
  if (!customer?.custom?.fields?.createVaultSetupTokenRequest) {
    return [];
  }
  let request: SetupTokenRequest = JSON.parse(
    customer?.custom?.fields?.createVaultSetupTokenRequest
  );
  if (customer?.custom?.fields?.PayPalUserId) {
    request = {
      customer: {
        id: customer.custom.fields.PayPalUserId,
      },
      ...request,
    };
  }

  const handleResponse = async () => {
    const response = await createVaultSetupToken(request);
    const extraActions = response.customer?.id
      ? [
          {
            action: 'setCustomField',
            name: 'PayPalUserId',
            value: response.customer?.id,
          },
        ]
      : undefined;
    return { response, extraActions };
  };

  return handleCustomer<SetupTokenRequest>(
    customer.id,
    'createVaultSetupToken',
    request,
    handleResponse
  );
};

export const handleCreatePaymentTokenRequest = async (
  customer: Customer
): Promise<UpdateAction[]> => {
  if (!customer?.custom?.fields?.createPaymentTokenRequest) {
    return [];
  }
  const request: PaymentTokenRequest = {
    customer: customer?.custom?.fields?.PayPalUserId
      ? {
          id: customer?.custom?.fields?.PayPalUserId,
        }
      : undefined,
    payment_source: {
      token: {
        type: TokenIdRequestTypeEnum.SetupToken,
        id: customer?.custom?.fields?.createPaymentTokenRequest,
      },
    },
  };

  const handleResponse = async () => {
    const response = await createPaymentToken(request);
    const extraActions = response.customer?.id
      ? [
          {
            action: 'setCustomField',
            name: 'PayPalUserId',
            value: response.customer?.id,
          },
        ]
      : undefined;
    return { response, extraActions };
  };

  return handleCustomer(
    customer.id,
    'createPaymentToken',
    request,
    handleResponse
  );
};

export const handleGetPaymentTokensRequest = async (
  customer: Customer
): Promise<UpdateAction[]> => {
  if (!customer?.custom?.fields?.getPaymentTokensRequest) {
    return [];
  }
  const customerId = customer?.custom?.fields?.PayPalUserId;

  const handleResponse = async () => {
    const response = await getPaymentTokens(customerId);
    response.payment_tokens = response.payment_tokens?.filter(
      ({ payment_source }) => payment_source && !('apple_pay' in payment_source)
    );
    return { response };
  };

  return handleCustomer(
    customer.id,
    'getPaymentTokens',
    { customerId },
    handleResponse
  );
};
