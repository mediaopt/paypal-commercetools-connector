import {
  Payment,
  PaymentAddTransactionAction,
  Transaction,
  TransactionState,
  TransactionType,
} from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import CustomError from '../errors/custom.error';
import {
  CheckoutPaymentIntent,
  Order,
  OrderAuthorizeRequest,
  OrderCaptureRequest,
  OrderRequest,
} from '../paypal/checkout_api';
import { CaptureRequest } from '../paypal/payments_api';
import {
  ClientTokenRequest,
  PayPalSettings,
  UpdateActions,
} from '../types/index.types';
import { getCurrentTimestamp } from '../utils/data.utils';
import { logger } from '../utils/logger.utils';
import {
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  mapCommercetoolsLineItemsToPayPalItems,
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
import { getCart, getOrder, getPayPalUserId } from './commercetools.service';
import { getSettings } from './config.service';
import {
  addDeliveryData,
  authorizePayPalOrder,
  capturePayPalAuthorization,
  capturePayPalOrder,
  createPayPalOrder,
  getClientToken,
  getPayPalCapture,
  getPayPalOrder,
  refundPayPalOrder,
  updateDeliveryData,
  updatePayPalOrder,
} from './paypal.service';

async function prepareCreateOrderRequest(
  payment: Payment,
  settings?: PayPalSettings
) {
  let request = JSON.parse(payment?.custom?.fields?.createPayPalOrderRequest);
  if (!request?.payment_source && request.paymentSource) {
    request.payment_source = request.paymentSource;
  }
  const cart = await getCart(payment.id);
  if (request?.payment_source?.pay_upon_invoice) {
    request.payment_source.pay_upon_invoice = {
      email: cart.customerEmail,
      name: {
        given_name: cart.billingAddress?.firstName,
        surname: cart.billingAddress?.lastName,
      },
      billing_address: {
        address_line_1: `${cart.billingAddress?.streetName} ${cart.billingAddress?.streetNumber}`,
        admin_area_2: cart.billingAddress?.city,
        postal_code: cart.billingAddress?.postalCode,
        country_code: cart.billingAddress?.country,
      },
      experience_context: {
        locale: 'de-DE',
        brand_name: settings?.ratePayBrandName?.de,
        logo_url: settings?.ratePayLogoUrl?.de,
        customer_service_instructions: [
          settings?.ratePayCustomerServiceInstructions?.de ?? 'Instructions',
        ],
      },
      ...request.payment_source.pay_upon_invoice,
    };
    request.intent = 'CAPTURE';
    request.processing_instruction = 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL';
  }
  const amountPlanned = payment.amountPlanned;
  const paymentDescription = settings?.paymentDescription
    ? settings?.paymentDescription[
        cart.locale ?? Object.keys(settings?.paymentDescription)[0]
      ]
    : undefined;
  request = {
    intent:
      settings?.payPalIntent.toUpperCase() ?? CheckoutPaymentIntent.Capture,
    purchase_units: [
      {
        amount: {
          currency_code: amountPlanned.currencyCode,
          value: mapCommercetoolsMoneyToPayPalMoney(amountPlanned),
          breakdown: mapCommercetoolsCartToPayPalPriceBreakdown(cart),
        },
        shipping: !cart.shippingAddress
          ? undefined
          : {
              type: 'SHIPPING',
              name: {
                full_name: `${cart.shippingAddress.firstName} ${cart.shippingAddress.lastName}`,
              },
              address: {
                address_line_1: `${cart.shippingAddress.streetName} ${cart.shippingAddress.streetNumber}`,
                admin_area_2: cart.shippingAddress.city,
                postal_code: cart.shippingAddress.postalCode,
                country_code: cart.shippingAddress.country,
              },
            },
        invoice_id: payment.id,
        description: paymentDescription,
        items: cart?.lineItems?.map((lineItem) =>
          mapCommercetoolsLineItemsToPayPalItems(
            lineItem,
            !!cart.shippingAddress,
            cart.locale
          )
        ),
      },
    ],
    ...request,
  } as OrderRequest;
  if (request?.storeInVaultOnSuccess) {
    const customer = {
      id: await getPayPalUserId(cart),
    };
    if (request?.payment_source?.paypal) {
      request.payment_source.paypal = {
        attributes: {
          vault: {
            store_in_vault: 'ON_SUCCESS',
            usage_type: 'MERCHANT',
            customer_type: 'CONSUMER',
          },
          customer,
        },
        ...request.payment_source.paypal,
      };
    }
    if (request?.payment_source?.venmo) {
      request.payment_source.venmo = {
        attributes: {
          vault: {
            store_in_vault: 'ON_SUCCESS',
            usage_type: 'MERCHANT',
          },
          customer,
        },
        ...request.payment_source.venmo,
      };
    }
    if (request?.payment_source?.card) {
      request.payment_source.card = {
        attributes: {
          vault: {
            store_in_vault: 'ON_SUCCESS',
          },
          customer,
        },
        ...request.payment_source.card,
      };
    }
  }
  return request;
}

export const handleCreateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.createPayPalOrderRequest) {
    return [];
  }
  const amountPlanned = payment.amountPlanned;
  const settings = await getSettings();
  const request = await prepareCreateOrderRequest(payment, settings);
  let updateActions = handleRequest('createPayPalOrder', request);
  try {
    const response = await createPayPalOrder(
      request,
      request?.clientMetadataId
    );
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
      action: 'setCustomField',
      name: 'PayPalOrderId',
      value: response.id,
    });
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
      request.orderId ?? payment.custom.fields?.PayPalOrderId,
      request as OrderCaptureRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId:
          response?.purchase_units &&
          response.purchase_units[0].payments?.captures
            ? response.purchase_units[0].payments.captures[0].id
            : response.id,
        timestamp: response.update_time,
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
      request.authorizationId ??
        findSuitableTransactionId(payment, 'Authorization', 'Success'),
      request as CaptureRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId: response?.id,
        timestamp: response.update_time,
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
    const request: CaptureRequest | undefined = amount
      ? {
          amount: {
            value: amount,
            currency_code: amountPlanned.currencyCode,
          },
        }
      : undefined;
    const response = await refundPayPalOrder(
      captureId ?? findSuitableTransactionId(payment, 'Charge', 'Success'),
      request
    );
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
        timestamp: response.update_time,
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
      request.orderId ?? payment.custom.fields?.PayPalOrderId,
      request as OrderAuthorizeRequest
    );
    updateActions.push({
      action: 'addTransaction',
      transaction: {
        type: 'Authorization',
        amount: payment.amountPlanned,
        interactionId:
          response?.purchase_units &&
          response.purchase_units[0].payments?.authorizations
            ? response.purchase_units[0].payments.authorizations[0].id
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
      handlePaymentResponse('updatePayPalOrder', response ?? '')
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
    const response = await getPayPalOrder(
      orderId ?? payment.custom.fields?.PayPalOrderId
    );
    return updateActions.concat(
      updatePaymentFields(response),
      handlePaymentResponse('getPayPalOrder', response)
    );
  } catch (e) {
    return handleError('getPayPalOrder', e);
  }
};

export const handleGetCaptureRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.getPayPalCaptureRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.getPayPalCaptureRequest);
  const { captureId } = request;
  const updateActions = handleRequest('getPayPalCapture', request);
  try {
    const response = await getPayPalCapture(
      captureId ?? findSuitableTransactionId(payment, 'Charge')
    );
    return updateActions.concat(
      handlePaymentResponse('getPayPalCapture', response)
    );
  } catch (e) {
    return handleError('getPayPalCapture', e);
  }
};

function updatePaymentFields(response: Order): UpdateActions {
  const { payment_source, status } = response;
  const updateActions: UpdateActions = [
    {
      action: 'setStatusInterfaceCode',
      interfaceCode: status,
    },
    {
      action: 'setStatusInterfaceText',
      interfaceText: status,
    },
  ];
  if (payment_source) {
    updateActions.push({
      action: 'setMethodInfoMethod',
      method: mapPayPalPaymentSourceToCommercetoolsMethodInfo(payment_source),
    });
  }
  return updateActions;
}

function findSuitableTransactionId(
  payment: Payment,
  type: TransactionType,
  status?: TransactionState
) {
  const transactions = payment?.transactions.filter(
    (transaction: Transaction): boolean =>
      transaction.type === type && (!status || status === transaction.state)
  );
  if (!transactions || transactions.length === 0) {
    throw new CustomError(500, 'The payment has no suitable transaction');
  }
  return transactions[transactions.length - 1].interactionId;
}

export const handleCreateTrackingInformation = async (payment: Payment) => {
  if (!payment?.custom?.fields?.createTrackingInformationRequest) {
    return [];
  }
  let request = JSON.parse(
    payment?.custom?.fields?.createTrackingInformationRequest
  );
  if (request?.carrier !== 'OTHER') {
    const order = await getOrder(payment?.id);
    const carrier = mapCommercetoolsCarrierToPayPalCarrier(
        request?.carrier,
        order?.shippingAddress?.country
    );
    request = {
      ...request,
      carrier,
      carrier_name_other: carrier === 'OTHER' ? request?.carrier : undefined,
    };
  }
  const captureId = findSuitableTransactionId(payment, 'Charge', 'Success');
  if (!request.capture_id && captureId) {
    request.capture_id = captureId;
  }
  const updateActions = handleRequest('createTrackingInformation', request);
  try {
    const response = await addDeliveryData(
      payment.custom.fields?.PayPalOrderId,
      request
    );
    return updateActions.concat(
      handlePaymentResponse('createTrackingInformation', response)
    );
  } catch (e) {
    return handleError('createTrackingInformation', e);
  }
};

export const handleUpdateTrackingInformation = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.updateTrackingInformationRequest) {
    return [];
  }
  const request = JSON.parse(
    payment?.custom?.fields?.updateTrackingInformationRequest
  );
  const { trackingId, patch } = request;
  const updateActions = handleRequest('updateTrackingInformation', request);
  try {
    const response = await updateDeliveryData(
      payment.custom.fields?.PayPalOrderId,
      trackingId,
      patch
    );
    return updateActions.concat(
      handlePaymentResponse('updateTrackingInformation', response ?? '')
    );
  } catch (e) {
    return handleError('updateTrackingInformation', e);
  }
};
