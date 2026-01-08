import { Customer } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import {
  PaymentTokenRequest,
  SetupTokenRequest,
  TokenIdRequestTypeEnum,
} from '../paypal/vault_api';
import { handleEntityActions } from '../utils/response.utils';
import {
  createPaymentToken,
  createVaultSetupToken,
  deletePaymentToken,
  generateUserIdToken,
  getPaymentTokens,
} from './paypal.service';

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

  return handleEntityActions(
    customerId,
    'getUserIDToken',
    {
      customerId,
    },
    handleResponse,
    'customer'
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

  return handleEntityActions(
    customer.id,
    'deletePaymentToken',
    { paymentToken },
    handleResponse,
    'customer'
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

  return handleEntityActions(
    customer.id,
    'createVaultSetupToken',
    request,
    handleResponse,
    'customer'
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

  return handleEntityActions(
    customer.id,
    'createPaymentToken',
    request,
    handleResponse,
    'customer'
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

  return handleEntityActions(
    customer.id,
    'getPaymentTokens',
    { customerId },
    handleResponse,
    'customer'
  );
};
