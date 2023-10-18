import {
  Payment,
  PaymentAddTransactionAction,
} from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { CheckoutPaymentIntent } from '../paypal/model-checkout-orders/checkoutPaymentIntent';
import { Order } from '../paypal/model-checkout-orders/order';
import { OrderAuthorizeRequest } from '../paypal/model-checkout-orders/orderAuthorizeRequest';
import { OrderCaptureRequest } from '../paypal/model-checkout-orders/orderCaptureRequest';
import { OrderRequest } from '../paypal/model-checkout-orders/orderRequest';
import { CaptureRequest } from '../paypal/model-payments-payment/captureRequest';
import { ClientTokenRequest, UpdateActions } from '../types/index.types';
import { getCurrentTimestamp } from '../utils/data.utils';
import { logger } from '../utils/logger.utils';
import {
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalOrderStatusToCommercetoolsTransactionState,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
} from '../utils/map.utils';
import {
  handleError,
  handlePaymentResponse,
  handleRequest,
} from '../utils/response.utils';
import { getSettings } from './config.service';
import {
  authorizePayPalOrder,
  capturePayPalAuthorization,
  capturePayPalOrder,
  createPayPalOrder,
  getClientToken,
  getPayPalOrder,
  refundPayPalOrder,
  updatePayPalOrder,
} from './paypal.service';

export const handleCreateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.createPayPalOrderRequest) {
    return [];
  }
  let request = JSON.parse(payment?.custom?.fields?.createPayPalOrderRequest);
  const settings = await getSettings();
  const amountPlanned = payment.amountPlanned;
  request = {
    intent:
      settings?.payPalIntent.toUpperCase() ?? CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: amountPlanned.currencyCode,
          value: mapCommercetoolsMoneyToPayPalMoney(amountPlanned),
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
    const requestAmount = request?.amount;
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type:
          settings?.payPalIntent.toUpperCase() === 'CAPTURE'
            ? 'Charge'
            : 'Authorization',
        amount: requestAmount
          ? {
              centAmount: mapPayPalMoneyToCommercetoolsMoney(
                requestAmount,
                amountPlanned.fractionDigits
              ),
              currencyCode: amountPlanned.currencyCode,
            }
          : amountPlanned,
        interactionId: response.id,
        timestamp: getCurrentTimestamp(),
        state: mapPayPalOrderStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    } as PaymentAddTransactionAction);
    return updateActions.concat(updatePaymentFields(response));
  } catch (e) {
    logger.error('Call to createPayPalOrder resulted in an error', e);
    return handleError('createPayPalOrder', e);
  }
};

export const handleCaptureOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.capturePayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(
    payment?.custom?.fields?.capturePayPalOrderRequest
  );
  const updateActions = handleRequest('capturePayPalOrder', request);
  try {
    const response = await capturePayPalOrder(
      request.orderId,
      request as OrderCaptureRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId:
          response?.purchaseUnits &&
          response.purchaseUnits[0].payments?.captures
            ? response.purchaseUnits[0].payments.captures[0].id
            : response.id,
        timestamp: response.updateTime,
        state: mapPayPalOrderStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    } as PaymentAddTransactionAction);
    return updateActions.concat(
      updatePaymentFields(response),
      handlePaymentResponse('capturePayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to capturePayPalOrder resulted in an error', e);
    return handleError('capturePayPalOrder', e);
  }
};

export const handleCaptureAuthorizationRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.capturePayPalAuthorizationRequest) {
    return [];
  }
  const request = JSON.parse(
    payment?.custom?.fields?.capturePayPalAuthorizationRequest
  );
  const updateActions = handleRequest('capturePayPalAuthorization', request);
  try {
    const response = await capturePayPalAuthorization(
      request.authorizationId,
      request as CaptureRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId: response?.id,
        timestamp: response.updateTime,
        state: mapPayPalCaptureStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    } as PaymentAddTransactionAction);
    return updateActions.concat(
      handlePaymentResponse('capturePayPalAuthorization', response)
    );
  } catch (e) {
    logger.error('Call to capturePayPalAuthorization resulted in an error', e);
    return handleError('capturePayPalAuthorization', e);
  }
};

export const handleRefundPayPalOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.refundPayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.refundPayPalOrderRequest);
  const updateActions: UpdateActions = handleRequest(
    'refundPayPalOrder',
    request
  );
  const { amount, captureId } = request;
  try {
    const amountPlanned = payment.amountPlanned;
    const response = amount
      ? await refundPayPalOrder(captureId, {
          amount: {
            value: amount,
            currencyCode: amountPlanned.currencyCode,
          },
        } as CaptureRequest)
      : await refundPayPalOrder(captureId);
    const refundedAmount = response?.amount?.value ?? amount ?? 0;
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Refund',
        amount: refundedAmount
          ? {
              centAmount: mapPayPalMoneyToCommercetoolsMoney(
                refundedAmount,
                amountPlanned.fractionDigits
              ),
              currencyCode: amountPlanned.currencyCode,
            }
          : amountPlanned,
        interactionId: response.id,
        timestamp: response.updateTime,
        state: mapPayPalRefundStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    });
    return updateActions.concat(
      handlePaymentResponse('refundPayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to refundPayPalOrder resulted in an error', e);
    return handleError('refundPayPalOrder', e);
  }
};

export const handleAuthorizeOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.authorizePayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(
    payment?.custom?.fields?.authorizePayPalOrderRequest
  );
  const updateActions = handleRequest('authorizePayPalOrder', request);
  try {
    const response = await authorizePayPalOrder(
      request.orderId,
      request as OrderAuthorizeRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Authorization',
        amount: payment.amountPlanned,
        interactionId:
          response?.purchaseUnits &&
          response.purchaseUnits[0].payments?.authorizations
            ? response.purchaseUnits[0].payments.authorizations[0].id
            : response.id,
        timestamp: getCurrentTimestamp(),
        state: mapPayPalOrderStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    } as PaymentAddTransactionAction);
    return updateActions.concat(
      updatePaymentFields(response),
      handlePaymentResponse('authorizePayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to authorizePayPalOrder resulted in an error', e);
    return handleError('authorizePayPalOrder', e);
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
  if (!payment?.custom?.fields?.updatePayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.updatePayPalOrderRequest);
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

export const handleGetOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.getPayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.getPayPalOrderRequest);
  const { orderId } = request;
  const updateActions = handleRequest('getPayPalOrder', request);
  try {
    const response = await getPayPalOrder(orderId);
    return updateActions.concat(
      updatePaymentFields(response),
      handlePaymentResponse('getPayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to getPayPalOrder resulted in an error', e);
    return handleError('getPayPalOrder', e);
  }
};

function updatePaymentFields(response: Order): UpdateActions {
  const updateActions: UpdateActions = [
    {
      action: 'setStatusInterfaceCode',
      interfaceCode: response.status,
    },
    {
      action: 'setStatusInterfaceText',
      interfaceText: response.status,
    },
  ];
  if (response.paymentSource) {
    updateActions.push({
      action: 'setMethodInfoMethod',
      method: mapPayPalPaymentSourceToCommercetoolsMethodInfo(
        response.paymentSource
      ),
    });
  }
  return updateActions;
}
