import { Payment } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { CheckoutPaymentIntent } from '../paypal/model/checkoutPaymentIntent';
import { OrderRequest } from '../paypal/model/orderRequest';
import { logger } from '../utils/logger.utils';
import {
  handleError,
  handlePaymentResponse,
  handleRequest,
} from '../utils/response.utils';
import {capturePayPalOrder, createPayPalOrder} from './paypal.service';
import {OrderCaptureRequest} from "../paypal/model/orderCaptureRequest";
import {mapCommercetoolsMoneyToPayPalMoney} from "../utils/map.utils";

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
    const response = await capturePayPalOrder(request.orderId, request as OrderCaptureRequest);
    return updateActions.concat(
        handlePaymentResponse('capturePayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to createPayPalOrder resulted in an error', e);
    return handleError('capturePayPalOrder', e);
  }
};
