import { Payment } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { CheckoutPaymentIntent } from '../paypal/model/checkoutPaymentIntent';
import { OrderRequest } from '../paypal/model/orderRequest';
import { logger } from '../utils/logger.utils';
import { mapCommercetoolsMoneyToPayPalMoney } from '../utils/map.utils';
import {
  handleError,
  handlePaymentResponse,
  handleRequest,
} from '../utils/response.utils';
import { createPayPalOrder } from './paypal.service';

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
  const updateActions = handleRequest('createPayPalOrder', request);
  try {
    const response = await createPayPalOrder(request);
    return updateActions.concat(
      handlePaymentResponse('createPayPalOrder', response)
    );
  } catch (e) {
    logger.error('Call to createPayPalOrder resulted in an error', e);
    return handleError('createPayPalOrder', e);
  }
};
