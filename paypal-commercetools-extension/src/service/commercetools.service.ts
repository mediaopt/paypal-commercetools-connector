import {
  CustomerUpdateAction,
  Payment,
  PaymentAddTransactionAction,
  PaymentChangeTransactionStateAction,
  PaymentUpdateAction,
  Transaction,
  TransactionDraft,
} from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { PAYPAL_CUSTOMER_TYPE_KEY } from '../connector/actions';
import CustomError from '../errors/custom.error';
import { CheckoutPaymentIntent, Order } from '../paypal/checkout_api';
import { Authorization2, Capture2 } from '../paypal/payments_api';
import { PayPalVaultPaymentTokenResource } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalOrderStatusToCommercetoolsTransactionState,
} from '../utils/map.utils';

const getPaymentByPayPalOrderId = async (orderId: string): Promise<Payment> => {
  const payments = await createApiRoot()
    .payments()
    .get({
      queryArgs: {
        where: `custom(fields(PayPalOrderId="${orderId}"))`,
      },
    })
    .execute();

  const results = payments.body.results;
  if (results.length !== 1) {
    logger.error('There is not any assigned payment');
    throw new CustomError(
      400,
      'Bad request: There is not any assigned payment'
    );
  }

  logger.info(`Found payment with id ${results[0].id}`);
  return results[0];
};

function prepareCreateOrUpdateTransactionAction(
  payment: Payment,
  transactionDraft: TransactionDraft
) {
  const commercetoolsTransactions = payment.transactions.filter(
    (transaction: Transaction) =>
      transaction.interactionId === transactionDraft.interactionId &&
      transaction.type === transactionDraft.type
  );
  if (!commercetoolsTransactions) {
    return [
      {
        action: 'addTransaction',
        transaction: transactionDraft,
      } as PaymentAddTransactionAction,
    ];
  }
  if (commercetoolsTransactions[0].state === transactionDraft.state) {
    logger.info('State did not change');
    return [];
  }
  logger.info(
    `Changing state from ${commercetoolsTransactions[0].state} to ${transactionDraft.state}`
  );
  return [
    {
      action: 'changeTransactionState',
      transactionId: commercetoolsTransactions[0].id,
      state: transactionDraft.state,
    } as PaymentChangeTransactionStateAction,
  ];
}

export const handlePaymentTokenWebhook = async (
  resource: PayPalVaultPaymentTokenResource
) => {
  if (!resource?.customer?.id) {
    return;
  }
  const orderId = resource.metadata.order_id;
  const payment = await getPaymentByPayPalOrderId(orderId);
  const { customerId } = await getCart(payment.id);
  if (!customerId) {
    return;
  }
  const customer = await createApiRoot()
    .customers()
    .withId({ ID: customerId })
    .get()
    .execute();
  const payPalCustomerId = resource.customer.id;
  const storedPayPalCustomerId = customer.body.custom?.fields?.PayPalUserId;
  if (storedPayPalCustomerId !== payPalCustomerId) {
    logger.info(
      `Changing PayPalUserId to ${payPalCustomerId} for ${customer.body.email}`
    );
    const action: CustomerUpdateAction = storedPayPalCustomerId
      ? {
          action: 'setCustomField',
          name: 'PayPalUserId',
          value: payPalCustomerId,
        }
      : {
          action: 'setCustomType',
          type: {
            key: PAYPAL_CUSTOMER_TYPE_KEY,
            typeId: 'type',
          },
          fields: {
            PayPalUserId: payPalCustomerId,
          },
        };
    await createApiRoot()
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.body.version,
          actions: [action],
        },
      })
      .execute();
  }
};

export const handleOrderWebhook = async (resource: Order) => {
  const orderId = resource.id ?? '';
  const payment = await getPaymentByPayPalOrderId(orderId);
  const transaction = {
    type:
      resource?.intent === CheckoutPaymentIntent.Capture
        ? 'Charge'
        : 'Authorization',
    amount:
      resource?.purchase_units && resource.purchase_units[0]?.amount?.value
        ? {
            centAmount: mapPayPalMoneyToCommercetoolsMoney(
              resource?.purchase_units[0].amount.value,
              payment?.amountPlanned?.fractionDigits
            ),
            currencyCode: payment?.amountPlanned?.currencyCode,
          }
        : payment.amountPlanned,
    interactionId: resource.id,
    timestamp: resource.update_time ?? resource.create_time,
    state: mapPayPalOrderStatusToCommercetoolsTransactionState(resource.status),
  };
  const updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

export const handleCaptureWebhook = async (resource: Capture2) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const payment = await getPaymentByPayPalOrderId(orderId);
  const transaction = {
    type: 'Charge',
    amount: {
      centAmount: mapPayPalMoneyToCommercetoolsMoney(
        resource?.amount?.value ?? '0',
        payment?.amountPlanned?.fractionDigits
      ),
      currencyCode: payment?.amountPlanned?.currencyCode,
    },
    interactionId: resource.id,
    timestamp: resource.update_time,
    state: mapPayPalCaptureStatusToCommercetoolsTransactionState(
      resource.status
    ),
  };
  const updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

export const handleAuthorizeWebhook = async (resource: Authorization2) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const payment = await getPaymentByPayPalOrderId(orderId);
  const transaction = {
    type: 'Authorization',
    amount: {
      centAmount: mapPayPalMoneyToCommercetoolsMoney(
        resource?.amount?.value ?? '0',
        payment?.amountPlanned?.fractionDigits
      ),
      currencyCode: payment?.amountPlanned?.currencyCode,
    },
    interactionId: resource.id,
    timestamp: resource.update_time,
    state: mapPayPalAuthorizationStatusToCommercetoolsTransactionState(
      resource.status
    ),
  } as TransactionDraft;
  const updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

const handleUpdatePayment = async (
  paymentId: string,
  paymentVersion: number,
  updateActions: PaymentUpdateAction[]
) => {
  try {
    logger.info(`updateActions ${JSON.stringify(updateActions)}`);
    if (!updateActions) {
      return;
    }

    const payment = await createApiRoot()
      .payments()
      .withId({ ID: paymentId })
      .post({
        body: {
          version: paymentVersion,
          actions: updateActions,
        },
      })
      .execute();

    if (!payment) {
      logger.error('Error in updating payment status');
      throw new CustomError(400, 'Error in updating payment status');
    }
    return payment;
  } catch (e) {
    logger.error('There was an error', e);
    throw e;
  }
};

export const getCart = async (paymentId: string) => {
  const apiRoot = createApiRoot();
  const cart = await apiRoot
    .carts()
    .get({
      queryArgs: {
        where: `paymentInfo(payments(id="${paymentId}"))`,
      },
    })
    .execute();
  if (cart.body.total !== 1) {
    throw new CustomError(500, 'payment is not associated with a cart.');
  }
  return cart.body.results[0];
};
