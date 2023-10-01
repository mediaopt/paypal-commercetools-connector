import { Payment } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { CheckoutPaymentIntent } from '../paypal/model/checkoutPaymentIntent';
import { OrderCaptureRequest } from '../paypal/model/orderCaptureRequest';
import { OrderRequest } from '../paypal/model/orderRequest';
import { ClientTokenRequest } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import { mapCommercetoolsMoneyToPayPalMoney } from '../utils/map.utils';
import {
  handleError,
  handlePaymentResponse,
  handleRequest,
} from '../utils/response.utils';
import {
  capturePayPalOrder,
  createPayPalOrder,
  getClientToken,
  updatePayPalOrder,
} from './paypal.service';

export const handleCreateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment.custom?.fields.createPayPalOrderRequest) {
    return [];
  }
  let request = JSON.parse(payment.custom.fields.createPayPalOrderRequest);
  request = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: payment.amountPlanned.currencyCode,
          value: mapCommercetoolsMoneyToPayPalMoney(payment.amountPlanned),
        },
      },
    ],
    ...request,
  } as OrderRequest;
  let updateActions = handleRequest('createPayPalOrder', request);
  try {
    const response = await createPayPalOrder(request);
    updateActions = updateActions.concat(
      handlePaymentResponse('createPayPalOrder', response)
    );
    if (!payment?.interfaceId) {
      updateActions.push({
        action: 'setInterfaceId',
        interfaceId: response.id,
      });
    }
    return updateActions;
  } catch (e) {
    logger.error('Call to createPayPalOrder resulted in an error', e);
    return handleError('createPayPalOrder', e);
  }
};

export const handleCaptureOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment.custom?.fields.capturePayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(payment.custom.fields.capturePayPalOrderRequest);
  const updateActions = handleRequest('capturePayPalOrder', request);
  try {
    const response = await capturePayPalOrder(
      request.orderId,
      request as OrderCaptureRequest
    );
    return updateActions.concat(
      handlePaymentResponse('capturePayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to createPayPalOrder resulted in an error', e);
    return handleError('capturePayPalOrder', e);
  }
};

export async function handleGetClientTokenRequest(payment?: Payment) {
  const clientTokenRequest = payment?.custom?.fields?.getClientTokenRequest;
  if (!clientTokenRequest) {
    return [];
  }
  let request: ClientTokenRequest = JSON.parse(clientTokenRequest);
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

export const handleUpdateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  const updateRequest = payment.custom?.fields.updatePayPalOrderRequest;
  if (!updateRequest) {
    return [];
  }
  const request = JSON.parse(updateRequest);
  const { orderId, patch } = request;
  const updateActions = handleRequest('updatePayPalOrder', request);
  try {
    const response = await updatePayPalOrder(orderId, patch);
    return updateActions.concat(
      handlePaymentResponse('updatePayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to updatePayPalOrder resulted in an error', e);
    return handleError('updatePayPalOrder', e);
  }
};
