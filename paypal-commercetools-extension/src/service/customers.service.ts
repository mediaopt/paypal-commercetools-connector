import { Customer } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import {
  PaymentTokenRequest,
  SetupTokenRequest,
  TokenIdRequestTypeEnum,
} from '../paypal/vault_api';
import { UpdateActions } from '../types/index.types';
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

export async function handleGetUserIDTokenRequest(customer: Customer) {
  const request = customer?.custom?.fields?.getUserIDTokenRequest;
  if (!request) {
    return [];
  }
  const customerId = customer?.custom?.fields?.PayPalUserId;
  const updateActions = handleRequest(
    'getUserIDToken',
    { customerId },
    undefined,
    false
  );
  try {
    const response = await generateUserIdToken(customerId);
    return updateActions.concat(
      handleCustomerResponse('getUserIDToken', response)
    );
  } catch (e) {
    logger.error('Call to getUserIDToken resulted in an error', e);
    return handleError('getUserIDToken', e);
  }
}

export async function handleDeletePaymentTokenRequest(customer: Customer) {
  const paymentToken = customer?.custom?.fields?.deletePaymentTokenRequest;
  if (!paymentToken) {
    return [];
  }
  const updateActions = handleRequest(
    'deletePaymentToken',
    { paymentToken },
    undefined,
    false
  );
  try {
    const response = await deletePaymentToken(paymentToken);
    return updateActions.concat(
      handleCustomerResponse('deletePaymentToken', response ?? '')
    );
  } catch (e) {
    logger.error('Call to deletePaymentToken resulted in an error', e);
    return handleError('deletePaymentToken', e);
  }
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
  logger.info(JSON.stringify(request));

  const updateActions: UpdateActions = handleRequest(
    'createVaultSetupToken',
    request,
    true,
    false
  );
  try {
    const response = await createVaultSetupToken(request);
    logger.info(JSON.stringify(response));
    if (response.customer?.id) {
      updateActions.push({
        action: 'setCustomField',
        name: 'PayPalUserId',
        value: response.customer?.id,
      });
    }
    return updateActions.concat(
      handleCustomerResponse('createVaultSetupToken', response)
    );
  } catch (e) {
    return handleError('createVaultSetupToken', e);
  }
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
  logger.info(JSON.stringify(request));
  const updateActions: UpdateActions = handleRequest(
    'createPaymentToken',
    request,
    true,
    false
  );
  try {
    const response = await createPaymentToken(request);
    logger.info(JSON.stringify(response));
    if (response.customer?.id) {
      updateActions.push({
        action: 'setCustomField',
        name: 'PayPalUserId',
        value: response.customer?.id,
      });
    }
    return updateActions.concat(
      handleCustomerResponse('createPaymentToken', response)
    );
  } catch (e) {
    return handleError('createPaymentToken', e);
  }
};

export const handleGetPaymentTokensRequest = async (
  customer: Customer
): Promise<UpdateAction[]> => {
  if (!customer?.custom?.fields?.getPaymentTokensRequest) {
    return [];
  }
  const customerId = customer?.custom?.fields?.PayPalUserId;
  const updateActions: UpdateActions = handleRequest(
    'getPaymentTokens',
    { customerId },
    true,
    false
  );
  try {
    const response = await getPaymentTokens(customerId);
    response.payment_tokens = response.payment_tokens?.filter(({payment_source}) => payment_source && !('apple_pay' in payment_source));
    logger.info(JSON.stringify(response));
    return updateActions.concat(
      handleCustomerResponse('getPaymentTokens', response)
    );
  } catch (e) {
    return handleError('getPaymentTokens', e);
  }
};
