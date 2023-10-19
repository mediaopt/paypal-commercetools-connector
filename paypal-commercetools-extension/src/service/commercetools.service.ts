import {
  Payment,
  PaymentAddTransactionAction,
  PaymentChangeTransactionStateAction,
  PaymentUpdateAction,
  Transaction,
  TransactionDraft,
} from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { CheckoutPaymentIntent } from '../paypal/model-checkout-orders/checkoutPaymentIntent';
import { Order } from '../paypal/model-checkout-orders/order';
import { Authorization2 } from '../paypal/model-payments-payment/authorization2';
import { Capture2 } from '../paypal/model-payments-payment/capture2';
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

export const handleOrderWebhook = async (resource: Order) => {
  const orderId = resource.id ?? '';
  const payment = await getPaymentByPayPalOrderId(orderId);
  const transaction = {
    type:
      resource?.intent === CheckoutPaymentIntent.Capture
        ? 'Charge'
        : 'Authorization',
    amount:
      resource?.purchaseUnits && resource.purchaseUnits[0]?.amount?.value
        ? {
            centAmount: mapPayPalMoneyToCommercetoolsMoney(
              resource?.purchaseUnits[0].amount.value,
              payment?.amountPlanned?.fractionDigits
            ),
            currencyCode: payment?.amountPlanned?.currencyCode,
          }
        : payment.amountPlanned,
    interactionId: resource.id,
    timestamp: resource.updateTime ?? resource.createTime,
    state: mapPayPalOrderStatusToCommercetoolsTransactionState(resource.status),
  };
  const updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

export const handleCaptureWebhook = async (resource: Capture2) => {
  const orderId = resource.supplementaryData?.relatedIds?.orderId ?? '';
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
    timestamp: resource.updateTime,
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
  const orderId = resource.supplementaryData?.relatedIds?.orderId ?? '';
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
    timestamp: resource.updateTime,
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
