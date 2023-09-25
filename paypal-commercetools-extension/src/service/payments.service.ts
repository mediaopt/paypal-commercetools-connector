import { Payment } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { logger } from '../utils/logger.utils';
import { getClientToken } from './paypal.service';
import {
  handleError,
  handlePaymentResponse,
  handleRequest,
} from '../utils/response.utils';

export interface ClientTokenRequest {
  customerId?: string | undefined;
  merchantAccountId?: string | undefined;
  options?:
    | {
        failOnDuplicatePaymentMethod?: boolean | undefined;
        makeDefault?: boolean | undefined;
        verifyCard?: boolean | undefined;
      }
    | undefined;
  version?: string | undefined;
}

export const handleCreateOrderRequest = (payment: Payment): UpdateAction[] => {
  if (!payment.custom?.fields.createPayPalOrderRequest) {
    return [];
  }
  // @TODO
  return [];
};

export async function handleGetClientTokenRequest(payment?: Payment) {
  if (!payment?.custom?.fields?.getClientTokenRequest) {
    return [];
  }
  let request: ClientTokenRequest = JSON.parse(
    payment.custom.fields.getClientTokenRequest
  );
  request = {
    merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT || undefined,
    ...request,
  };
  const updateActions = handleRequest('getClientToken', request);
  try {
    const response = await getClientToken();
    return updateActions.concat(
      handlePaymentResponse('getClientToken', response)
    );
  } catch (e) {
    logger.error('Call to getClientToken resulted in an error', e);
    return handleError('getClientToken', e);
  }
}
