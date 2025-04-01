import {
  Cart,
  CustomerUpdateAction,
  Extension,
  Payment,
  PaymentAddTransactionAction,
  PaymentChangeTransactionStateAction,
  PaymentUpdateAction,
  Transaction,
  TransactionDraft,
} from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { createApiRoot } from '../client/create.client';
import { PAYPAL_CUSTOMER_TYPE_KEY } from '../connector/actions';
import CustomError from '../errors/custom.error';
import { Authorization2, Capture2 } from '../paypal/payments_api';
import { Order, PayPalVaultPaymentTokenResource } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapPayPalMoneyToCommercetoolsMoney,
} from '../utils/map.utils';
import { getSettings } from './config.service';
import { sendEmail } from './mail.service';
import { updatePaymentFields } from './payments.service';
import { getPayPalOrder } from './paypal.service';

export const getPaymentByPayPalOrderId = async (
  orderId: string
): Promise<Payment> => {
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
): PaymentUpdateAction[] {
  const commercetoolsTransactions = payment.transactions.filter(
    (transaction: Transaction) =>
      transaction.interactionId === transactionDraft.interactionId &&
      transaction.type === transactionDraft.type
  );
  if (commercetoolsTransactions.length === 0) {
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
  resource: PayPalVaultPaymentTokenResource,
  payment: Payment
) => {
  if (!resource?.customer?.id) {
    return;
  }
  const cart = await getCart(payment.id);
  const customer = await getCustomerByCart(cart);
  if (!customer) {
    return;
  }
  const payPalCustomerId = resource.customer.id;
  const storedPayPalCustomerId = customer?.custom?.fields?.PayPalUserId;
  if (storedPayPalCustomerId !== payPalCustomerId) {
    logger.info(
      `Changing PayPalUserId to ${payPalCustomerId} for ${customer.email}`
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
      .withId({ ID: customer.id })
      .post({
        body: {
          version: customer.version,
          actions: [action],
        },
      })
      .execute();
  }
};

export const handleOrderWebhook = async (resource: Order, payment: Payment) => {
  const orderId = resource.id ?? '';
  const order = await getPayPalOrder(orderId);

  const updateActions = updatePaymentFields(order);
  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

export const handleCaptureWebhook = async (
  resource: Capture2,
  payment: Payment,
  eventType: string
) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';

  const payPalOrder = await getPayPalOrder(orderId);
  const payUponInvoiceSource = payPalOrder?.payment_source?.pay_upon_invoice;
  if (payUponInvoiceSource && eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const settings = await getSettings();
    let customerEmail = payUponInvoiceSource.email;
    if (!customerEmail) {
      const order = await getOrder(payment.id);
      customerEmail = order.customerEmail ?? '';
    }
    const fallbackEmailText =
      'Bitte überweisen Sie den Betrag von ##price## an folgendes Konto!\n' +
      'Verwendungszweck: ##payment_reference##\n' +
      'BIC: ##bic##\n' +
      'Bank Name: ##bank_name##\n' +
      'IBAN: ##iban##\n' +
      'Kontoinhaber: ##account_holder_name##\n' +
      'Instructions: ##customer_service_instructions##';
    let emailText =
      settings?.payUponInvoiceMailEmailText?.de ?? fallbackEmailText;
    const purchaseUnit = payPalOrder?.purchase_units
      ? payPalOrder?.purchase_units[0]
      : undefined;
    const mapping = {
      ...payUponInvoiceSource.deposit_bank_details,
      payment_reference: payUponInvoiceSource.payment_reference,
      customer_service_instructions:
        payUponInvoiceSource?.experience_context?.customer_service_instructions.join(
          '\n'
        ),
      price:
        purchaseUnit?.amount?.value + ' ' + purchaseUnit?.amount?.currency_code,
    };
    Object.entries(mapping).forEach(([key, value]: string[]) => {
      emailText = emailText.replace(`##${key}##`, value);
    });
    await sendEmail(
      customerEmail,
      settings?.payUponInvoiceMailSubject?.de ?? 'Pay Upon Invoice',
      emailText
    );
  }
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
  let updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  updateActions = updateActions.concat(
    updatePaymentFields(await getPayPalOrder(orderId))
  );

  await handleUpdatePayment(payment.id, payment.version, updateActions);
};

export const handleAuthorizeWebhook = async (
  resource: Authorization2,
  payment: Payment
) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';

  const authorizationType =
    resource.status === 'VOIDED' ? 'CancelAuthorization' : 'Authorization';
  const transaction = {
    type: authorizationType,
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
  let updateActions = prepareCreateOrUpdateTransactionAction(
    payment,
    transaction
  );
  updateActions = updateActions.concat(
    updatePaymentFields(await getPayPalOrder(orderId))
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

export const getOrder = async (paymentId: string) => {
  const apiRoot = createApiRoot();
  const order = await apiRoot
    .orders()
    .get({
      queryArgs: {
        where: `paymentInfo(payments(id="${paymentId}"))`,
      },
    })
    .execute();
  if (order.body.total !== 1) {
    throw new CustomError(500, 'payment is not associated with an order.');
  }
  return order.body.results[0];
};

async function getCustomerByCart({ customerId }: Cart) {
  if (!customerId) {
    return undefined;
  }
  const apiRoot = createApiRoot();
  return (await apiRoot.customers().withId({ ID: customerId }).get().execute())
    .body;
}

export const getPayPalUserId = async (
  cart: Cart
): Promise<string | undefined> => {
  const user = await getCustomerByCart(cart);
  return user?.custom?.fields?.PayPalUserId;
};

export async function findMatchingExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  extensionKey: string,
  applicationUrl: string
): Promise<Extension | undefined> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${extensionKey}"`,
      },
    })
    .execute();

  const matchingExtensions = extensions.filter(
    ({ destination }) =>
      destination.type === 'HTTP' && destination.url === applicationUrl
  );
  return matchingExtensions.length > 0 ? matchingExtensions[0] : undefined;
}
