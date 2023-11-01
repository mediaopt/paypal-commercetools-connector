import { Customer } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { SetupTokenRequest } from '../paypal/vault_api';
import { UpdateActions } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {
  handleCustomerResponse,
  handleError,
  handleRequest,
} from '../utils/response.utils';
import { createVaultSetupToken, generateUserIdToken } from './paypal.service';

export async function handleGetUserIDTokenRequest(customer: Customer) {
  const request = customer?.custom?.fields?.getUserIDTokenRequest;
  if (!request) {
    return [];
  }
  const { customerId } = JSON.parse(request);
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
export const handleCreateVaultSetupTokenRequest = async (
  customer: Customer
): Promise<UpdateAction[]> => {
  if (!customer?.custom?.fields?.createVaultSetupTokenRequest) {
    return [];
  }
  logger.info(customer?.custom?.fields?.createVaultSetupTokenRequest);
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
    return updateActions.concat(
      handleCustomerResponse('createVaultSetupToken', response)
    );
  } catch (e) {
    return handleError('createVaultSetupToken', e);
  }
};
