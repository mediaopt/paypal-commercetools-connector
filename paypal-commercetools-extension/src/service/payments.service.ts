import {
  Payment,
  PaymentAddTransactionAction,
  PaymentUpdateAction,
  Transaction,
  TransactionDraft,
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
  Patch,
  PurchaseUnit,
} from '../paypal/checkout_api';
import {
  Authorization2StatusEnum,
  Capture2StatusEnum,
  CaptureRequest,
} from '../paypal/payments_api';
import {
  ClientTokenRequest,
  PayPalSettings,
  UpdateActions,
} from '../types/index.types';
import { getCurrentTimestamp } from '../utils/data.utils';
import {
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
} from '../utils/map.utils';
import { handleEntityActions, handleError } from '../utils/response.utils';
import { getCart, getOrder, getPayPalUserId } from './commercetools.service';
import { getSettings } from './config.service';
import {
  addDeliveryData,
  authorizePayPalOrder,
  capturePayPalAuthorization,
  voidPayPalAuthorization,
  capturePayPalOrder,
  createPayPalOrder,
  getClientToken,
  getPayPalCapture,
  getPayPalOrder,
  refundPayPalOrder,
  updateDeliveryData,
  updatePayPalOrder,
} from './paypal.service';
import customError from '../errors/custom.error';

type PayPalTransaction = 'captures' | 'authorizations';

const addTransactionAction = ({
  type,
  amount,
  interactionId,
  timestamp,
  state,
}: TransactionDraft): PaymentAddTransactionAction => ({
  action: 'addTransaction',
  transaction: {
    type,
    amount,
    interactionId,
    state,
    timestamp: timestamp ?? getCurrentTimestamp(),
  },
});

async function prepareCreateOrderRequest(
  payment: Payment,
  settings?: PayPalSettings
) {
  let request = JSON.parse(payment?.custom?.fields?.createPayPalOrderRequest);
  if (!request?.payment_source && request.paymentSource) {
    request.payment_source = request.paymentSource;
    delete request.paymentSource;
  }
  const isPayUponInvoice = !!request?.payment_source?.pay_upon_invoice;
  const cart = await getCart(payment.id, 'CreatePayPalOrder');
  const relevantCartCost =
    cart.taxedPrice?.totalGross?.centAmount ?? cart.totalPrice.centAmount;
  if (isPayUponInvoice) {
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
  const paymentSource = request?.payment_source
    ? request?.payment_source[Object.keys(request?.payment_source)[0]]
    : undefined;
  if (paymentSource && cart.shippingAddress) {
    paymentSource.experience_context = {
      shipping_preference: 'SET_PROVIDED_ADDRESS',
      ...paymentSource?.experience_context,
    };
  }
  const amountPlanned = payment.amountPlanned;
  const paymentDescription = settings?.paymentDescription
    ? settings?.paymentDescription[
        cart.locale ?? Object.keys(settings?.paymentDescription)[0]
      ]
    : undefined;
  const matchingAmounts = amountPlanned.centAmount === relevantCartCost;
  if (isPayUponInvoice) {
    if (!matchingAmounts)
      throw new CustomError(
        '400',
        'For Pay Upon Invoice, the payment amount must exactly match the cart total gross amount if available and total price if total gross is not provided.'
      );
  }
  request = {
    intent:
      settings?.payPalIntent.toUpperCase() ?? CheckoutPaymentIntent.Capture,
    purchase_units: [
      {
        amount: {
          currency_code: amountPlanned.currencyCode,
          value: mapCommercetoolsMoneyToPayPalMoney(amountPlanned),
          breakdown: matchingAmounts
            ? mapCommercetoolsCartToPayPalPriceBreakdown(cart)
            : null,
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
        invoice_id: request?.custom_invoice_id ?? payment.id,
        custom_id: request?.custom_id,
        description: paymentDescription,
        items: mapValidCommercetoolsLineItemsToPayPalItems(
          matchingAmounts,
          paymentSource?.experience_context?.shipping_preference !==
            'NO_SHIPPING' || !!cart.shippingAddress,
          cart.taxCalculationMode,
          isPayUponInvoice,
          cart?.lineItems,
          cart.locale
        ),
      },
    ],
    ...request,
  } as OrderRequest;
  delete request?.custom_invoice_id;
  delete request?.custom_id;
  if (request?.storeInVaultOnSuccess) {
    delete request.storeInVaultOnSuccess;
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
        ...request.payment_source.card,
        attributes: {
          vault: {
            store_in_vault: 'ON_SUCCESS',
          },
          customer,
          ...request.payment_source.card.attributes,
        },
      };
    }
  }
  return request;
}

const relevantTransaction = (
  paymentType: PayPalTransaction,
  purchase_units?: PurchaseUnit[]
) => {
  const relevantPayment =
    purchase_units && purchase_units[0].payments?.[paymentType];
  return relevantPayment?.length ? relevantPayment[0] : undefined;
};

const actualTransactionStatus = (
  relevantTransactionType: PayPalTransaction,
  purchase_units?: PurchaseUnit[]
) => {
  const relevantPayPalPayment = relevantTransaction(
    relevantTransactionType,
    purchase_units
  );
  if (!relevantPayPalPayment)
    throw new customError(500, 'No relevant PayPal payment found');
  else
    return relevantTransactionType === 'authorizations'
      ? mapPayPalAuthorizationStatusToCommercetoolsTransactionState(
          relevantPayPalPayment.status as Authorization2StatusEnum
        )
      : mapPayPalCaptureStatusToCommercetoolsTransactionState(
          relevantPayPalPayment.status as Capture2StatusEnum
        );
};

export const handleCreateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.createPayPalOrderRequest) {
    return [];
  }
  const settings = await getSettings();
  const request = await prepareCreateOrderRequest(payment, settings);
  const customId = request?.purchase_units[0]?.custom_id;

  const handleResponse = async () => {
    const response = await createPayPalOrder(
      request,
      request?.clientMetadataId
    );
    const extraActions: UpdateActions = [
      {
        action: 'setCustomField',
        name: 'PayPalOrderId',
        value: response.id,
      },
    ];
    if (!payment?.interfaceId) {
      extraActions.push({
        action: 'setInterfaceId',
        interfaceId: response.id,
      });
    }
    if (customId)
      extraActions.push({
        action: 'setCustomField',
        name: 'PayPalCustomId',
        value: customId,
      });
    return {
      response,
      extraActions: extraActions.concat(updatePaymentFields(response)),
    };
  };
  return handleEntityActions(
    payment.id,
    'createPayPalOrder',
    request,
    handleResponse
  );
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

  const handleResponse = async () => {
    const response = await capturePayPalOrder(
      request.orderId ?? payment.custom?.fields?.PayPalOrderId,
      request as OrderCaptureRequest
    );
    const transactionState = actualTransactionStatus(
      'captures',
      response?.purchase_units
    );
    if (transactionState !== 'Success') response.status = undefined;
    const extraActions: UpdateActions = [
      addTransactionAction({
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId:
          relevantTransaction('captures', response?.purchase_units)?.id ??
          response.id,
        timestamp: response.update_time,
        state: transactionState,
      }),
    ];
    return {
      response,
      extraActions: extraActions.concat(updatePaymentFields(response)),
    };
  };

  return handleEntityActions(
    payment.id,
    'capturePayPalOrder',
    request,
    handleResponse
  );
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
  const handleResponse = async () => {
    const response = await capturePayPalAuthorization(
      request.authorizationId ??
        findSuitableTransactionId(payment, 'Authorization', 'Success'),
      request as CaptureRequest
    );
    const extraActions: UpdateActions = [
      addTransactionAction({
        type: 'Charge',
        amount: payment.amountPlanned,
        interactionId: response?.id,
        timestamp: response.update_time,
        state: mapPayPalCaptureStatusToCommercetoolsTransactionState(
          response.status
        ),
      }),
    ];
    return { response, extraActions };
  };

  return handleEntityActions(
    payment.id,
    'capturePayPalAuthorization',
    request,
    handleResponse
  );
};

export const handleVoidAuthorizationRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.voidPayPalAuthorizationRequest) {
    return [];
  }
  const request = JSON.parse(
    payment?.custom?.fields?.voidPayPalAuthorizationRequest
  );
  const transactionId =
    request.authorizationId ??
    findSuitableTransactionId(payment, 'Authorization', 'Success');

  const handleResponse = async () => {
    const response = await voidPayPalAuthorization(transactionId);
    const extraActions: UpdateActions = [
      addTransactionAction({
        type: 'CancelAuthorization',
        amount: payment.amountPlanned,
        interactionId: response?.id,
        timestamp: response.update_time,
        state: mapPayPalAuthorizationStatusToCommercetoolsTransactionState(
          response.status
        ),
      }),
    ];
    return { response, extraActions };
  };

  return handleEntityActions(
    payment.id,
    'voidPayPalAuthorization',
    request,
    handleResponse
  );
};

export const handleRefundPayPalOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.refundPayPalOrderRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.refundPayPalOrderRequest);
  const { amount, captureId } = request;
  const amountPlanned = payment.amountPlanned;

  const handleResponse = async () => {
    const response = await refundPayPalOrder(
      captureId ?? findSuitableTransactionId(payment, 'Charge', 'Success'),
      amount
        ? {
            amount: {
              value: amount,
              currency_code: amountPlanned.currencyCode,
            },
          }
        : undefined
    );
    const refundedAmount = response?.amount?.value ?? amount ?? 0;
    const extraActions: UpdateActions = [
      addTransactionAction({
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
      }),
    ];
    return { response, extraActions };
  };
  return handleEntityActions(
    payment.id,
    'refundPayPalOrder',
    request,
    handleResponse
  );
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
  const handleResponse = async () => {
    const response = await authorizePayPalOrder(
      request.orderId ?? payment.custom?.fields?.PayPalOrderId,
      request as OrderAuthorizeRequest
    );
    const transactionState = actualTransactionStatus(
      'authorizations',
      response?.purchase_units
    );
    if (transactionState !== 'Success') response.status = undefined;
    const extraActions: UpdateActions = [
      addTransactionAction({
        type: 'Authorization',
        amount: payment.amountPlanned,
        interactionId:
          relevantTransaction('authorizations', response?.purchase_units)?.id ??
          response.id,
        timestamp: response.update_time,
        state: transactionState,
      }),
    ];
    return {
      response,
      extraActions: extraActions.concat(updatePaymentFields(response)),
    };
  };

  return handleEntityActions(
    payment.id,
    'authorizePayPalOrder',
    request,
    handleResponse
  );
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

  const handleResponse = async () => {
    const response = await getClientToken();
    return { response };
  };

  return handleEntityActions(
    payment?.id,
    'getClientToken',
    request,
    handleResponse
  );
}

export const handleUpdateOrderRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.updatePayPalOrderRequest) {
    return [];
  }
  try {
    let request = JSON.parse(payment?.custom?.fields?.updatePayPalOrderRequest);
    const cart = await getCart(payment.id, 'UpdatePayPalOrder');
    // let amountPlanned = payment.amountPlanned;

    const relevantCartPrice = cart.taxedPrice?.totalGross?.centAmount
      ? cart.taxedPrice?.totalGross
      : cart.totalPrice;

    const paymentDoestMatchCart = !!(
      relevantCartPrice?.centAmount &&
      relevantCartPrice.centAmount !== payment.amountPlanned.centAmount
    );

    const currentPayment = paymentDoestMatchCart
      ? relevantCartPrice
      : payment.amountPlanned;

    request = {
      ...request,
      orderId: payment.custom.fields?.PayPalOrderId,
      patch: [
        {
          op: 'replace',
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            currency_code: currentPayment.currencyCode,
            value: mapCommercetoolsMoneyToPayPalMoney(currentPayment),
            breakdown: mapCommercetoolsCartToPayPalPriceBreakdown(cart),
          },
        } as Patch,
        {
          op: 'replace',
          path: "/purchase_units/@reference_id=='default'/items",
          value: mapValidCommercetoolsLineItemsToPayPalItems(
            true,
            !!cart.shippingAddress,
            cart.taxCalculationMode,
            payment.paymentMethodInfo.method === 'pay_upon_invoice',
            cart?.lineItems,
            cart.locale
          ),
        } as Patch,
      ],
    };
    const { orderId, patch } = request;

    const handleResponse = async () => {
      const response = (await updatePayPalOrder(orderId, patch)) ?? '';
      return {
        response,
        extraActions: paymentDoestMatchCart
          ? [
              {
                action: 'changeAmountPlanned',
                amount: currentPayment.centAmount,
              },
            ]
          : undefined,
      };
    };

    return handleEntityActions(
      payment.id,
      'updatePayPalOrder',
      request,
      handleResponse
    );
  } catch (e) {
    return handleError('updatePayPalOrder', payment.id, e);
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

  const handleResponse = async () => {
    const response = await getPayPalOrder(
      orderId ?? payment.custom?.fields?.PayPalOrderId
    );
    return { response, extraActions: updatePaymentFields(response) };
  };
  return handleEntityActions(
    payment.id,
    'getPayPalOrder',
    request,
    handleResponse
  );
};

export const handleGetCaptureRequest = async (
  payment: Payment
): Promise<UpdateAction[]> => {
  if (!payment?.custom?.fields?.getPayPalCaptureRequest) {
    return [];
  }
  const request = JSON.parse(payment?.custom?.fields?.getPayPalCaptureRequest);
  const { captureId } = request;

  const handleResponse = async () => {
    const response = await getPayPalCapture(
      captureId ?? findSuitableTransactionId(payment, 'Charge')
    );
    return { response };
  };
  return handleEntityActions(
    payment.id,
    'getPayPalCapture',
    request,
    handleResponse
  );
};

export function updatePaymentFields(response: Order): PaymentUpdateAction[] {
  const { payment_source, status } = response;
  const updateActions: PaymentUpdateAction[] = status
    ? [
        {
          action: 'setStatusInterfaceCode',
          interfaceCode: status,
        },
        {
          action: 'setStatusInterfaceText',
          interfaceText: status ?? '',
        },
      ]
    : [];
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
    throw new CustomError(
      500,
      `The payment ${payment.id} has no suitable transaction (type ${type}, state: ${status} or none)`
    );
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
    const order = await getOrder(payment?.id, 'CreatePayPalTracking');
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

  const handleResponse = async () => {
    const response = await addDeliveryData(
      payment.custom?.fields?.PayPalOrderId,
      request
    );
    return { response };
  };

  return handleEntityActions(
    payment.id,
    'createTrackingInformation',
    request,
    handleResponse
  );
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
  if (!request?.trackingId) {
    const order = await getOrder(payment.id, 'UpdatePayPalTracking');
    const deliveryWithParcel = order?.shippingInfo?.deliveries?.find(
      (delivery) => delivery.parcels.length > 0
    );
    if (deliveryWithParcel) {
      const parcel = deliveryWithParcel?.parcels[0];
      const captureId = findSuitableTransactionId(payment, 'Charge', 'Success');
      request.trackingId = `${captureId}-${parcel?.trackingData?.trackingId}`;
    }
  }
  const { trackingId, patch } = request;

  const handleResponse = async () => {
    const response =
      (await updateDeliveryData(
        payment.custom?.fields?.PayPalOrderId,
        trackingId,
        patch
      )) ?? '';
    return { response };
  };

  return handleEntityActions(
    payment.id,
    'updateTrackingInformation',
    request,
    handleResponse
  );
};
