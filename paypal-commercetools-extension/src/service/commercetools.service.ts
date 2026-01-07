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

import CustomError from '../errors/custom.error';
import { Authorization2, Capture2 } from '../paypal/payments_api';
import { Order, PayPalVaultPaymentTokenResource } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import {
  isPaymentUpToDate,
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapPayPalMoneyToCommercetoolsMoney,
} from '../utils/map.utils';
import { getSettings } from './config.service';
import { sendEmail } from './mail.service';
import { updatePaymentFields } from './payments.service';
import { getPayPalOrder } from './paypal.service';
import {
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
} from '../constants';
import { sleep } from '../utils/response.utils';

const TIMEOUT_PAYMENT = 9500;
const RETRY_DELAY = 2000;

const getPaymentByPayPalOrderId = async (
  orderId: string,
  paymentAction: string
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
    //more than 1 assigned order is prevented on commercetools side
    const detailedErrorMessage = `${paymentAction} action impossible - there is not any assigned commercetools payment for the PayPal order id ${orderId}`;
    logger.error(detailedErrorMessage);
    throw new CustomError(400, `Bad request: ${detailedErrorMessage}`);
  }

  logger.info(
    `For the PayPal order found assigned commercetools payment with id ${results[0].id}`
  );
  return results[0];
};

function prepareCreateOrUpdateTransactionAction(
  payment: Payment,
  transactionDraft: TransactionDraft,
  webhookAction: string
): PaymentUpdateAction[] {
  const commercetoolsTransactions = payment.transactions.filter(
    (transaction: Transaction) =>
      transaction.interactionId === transactionDraft.interactionId &&
      transaction.type === transactionDraft.type
  );
  if (commercetoolsTransactions.length === 0) {
    logger.info(
      `Creating new transaction for payment ${payment.id} within ${webhookAction} scope`
    );
    return [
      {
        action: 'addTransaction',
        transaction: transactionDraft,
      } as PaymentAddTransactionAction,
    ];
  }
  if (commercetoolsTransactions[0].state === transactionDraft.state) {
    logger.info(
      `Payment ${payment.id} transaction ${commercetoolsTransactions[0].id} is already up to date in a state ${commercetoolsTransactions[0].state} within ${webhookAction} scope. No transaction update action required.`
    );
    return [];
  }
  logger.info(
    `For payment ${payment.id} changing state from ${commercetoolsTransactions[0].state} to ${transactionDraft.state} within ${webhookAction} scope`
  );
  return [
    {
      action: 'changeTransactionState',
      transactionId: commercetoolsTransactions[0].id,
      state: transactionDraft.state,
    } as PaymentChangeTransactionStateAction,
  ];
}

const waitForCart = async (
  paymentId: string,
  paymentAction: string
): Promise<Cart> => {
  const maxWaitForCartTime = Date.now() + TIMEOUT_PAYMENT;
  const fetchCartLogMessage = (success = false): string =>
    `waitForCart: ${
      success ? 'successfully fetched' : 'could not fetch'
    } commercetools cart for commercetools payment ${paymentId} in scope of ${paymentAction}`;
  while (Date.now() < maxWaitForCartTime) {
    try {
      const cart = await getCart(paymentId, paymentAction);
      logger.info(fetchCartLogMessage(true));
      return cart;
    } catch (error) {
      logger.info(`${fetchCartLogMessage()}`);
      await sleep(RETRY_DELAY);
    }
  }
  const failMessage = `${fetchCartLogMessage()} within payment extension's time limit`;
  logger.error(failMessage);
  throw new CustomError(500, failMessage);
};

export const handlePaymentTokenWebhook = async (
  resource: PayPalVaultPaymentTokenResource
) => {
  if (!resource?.customer?.id) {
    return;
  }
  const paymentAction = 'PayPalPaymentTokenWebhook';

  const orderId = resource.metadata.order_id;
  const payment = await getPaymentByPayPalOrderId(orderId, paymentAction);
  const cart = await waitForCart(payment.id, paymentAction);
  const customer = await getCustomerByCart(cart);
  if (!customer) {
    logger.info(
      `${paymentAction} action is not possible - no customer found for cart ${cart.id}`
    );
    return;
  }
  const payPalCustomerId = resource.customer.id;
  const storedPayPalCustomerId = customer?.custom?.fields?.PayPalUserId;
  if (storedPayPalCustomerId !== payPalCustomerId) {
    logger.info(
      `Changing PayPalUserId within ${paymentAction} scope due to processing payment ${payment.id}`
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

export const handleOrderWebhook = async (resource: Order) => {
  const orderId = resource.id ?? '';
  const paymentAction = 'CheckoutOrderWebhook';
  const payment = await getPaymentByPayPalOrderId(orderId, paymentAction);
  await handleUpdatePayment(orderId, payment, paymentAction);
};

export const handleCaptureWebhook = async (
  resource: Capture2,
  eventType: string
) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const payPalOrder = await getPayPalOrder(orderId);
  const paymentAction = 'CapturePayPalOrderWebhook';
  const payUponInvoiceSource = payPalOrder?.payment_source?.pay_upon_invoice;

  if (!(payUponInvoiceSource && eventType === 'PAYMENT.CAPTURE.COMPLETED')) {
    await sleep(TIMEOUT_PAYMENT); //this prevents concurrent modification occurring if webhook and capturePayPalOrder try to change the status simultaneously, PayUponInvoice works different, see https://developer.paypal.com/docs/checkout/apm/pay-upon-invoice/integrate-pui-merchant/
  }

  const payment = await getPaymentByPayPalOrderId(orderId, paymentAction);

  if (payUponInvoiceSource && eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const settings = await getSettings();
    let customerEmail = payUponInvoiceSource.email;
    if (!customerEmail) {
      const order = await getOrder(payment.id, paymentAction);
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
      payment.id,
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
  await handleUpdatePayment(orderId, payment, paymentAction, transaction);
};

export const handleAuthorizeWebhook = async (resource: Authorization2) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const authorizationType =
    resource.status === 'VOIDED' ? 'CancelAuthorization' : 'Authorization';
  const paymentAction = `${authorizationType}PayPalOrderWebhook`;
  const payment = await getPaymentByPayPalOrderId(orderId, paymentAction);

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
  await handleUpdatePayment(orderId, payment, paymentAction, transaction);
};

const handleUpdatePayment = async (
  orderId: string,
  payment: Payment,
  paymentAction: string,
  transactionDraft?: TransactionDraft
) => {
  const order = await getPayPalOrder(orderId);
  const transactionActions: PaymentUpdateAction[] = transactionDraft
    ? prepareCreateOrUpdateTransactionAction(
        payment,
        transactionDraft,
        paymentAction
      )
    : [];
  const paymentUpdateActions = updatePaymentFields(order);
  const upToDate = isPaymentUpToDate(payment, paymentUpdateActions);
  const updateActions = transactionActions.concat(
    upToDate ? [] : paymentUpdateActions
  );
  const { id, version } = payment;
  const logRelevantEntities = `payment ${id}${
    transactionDraft ? ` and transaction ${transactionDraft.interactionId}` : ''
  }`;

  if (!updateActions.length) {
    logger.info(
      `${logRelevantEntities} already up do date. No action required in scope of ${paymentAction}`
    );
    return;
  }
  logger.info(
    `update required for ${logRelevantEntities} in scope of ${paymentAction}, previous payment state: ${payment.paymentStatus.interfaceCode}`
  );
  try {
    const updatedPayment = await createApiRoot()
      .payments()
      .withId({ ID: id })
      .post({
        body: {
          version,
          actions: updateActions,
        },
      })
      .execute();

    if (!updatedPayment) {
      const detailedErrorMessage = `Error in updating commercetools ${logRelevantEntities}, payment version ${version}`;
      logger.error(detailedErrorMessage);
      throw new CustomError(400, detailedErrorMessage);
    }
    return updatedPayment;
  } catch (e) {
    logger.error('There was an error', e);
    throw e;
  }
};

export const getCart = async (paymentId: string, paymentAction: string) => {
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
    throw new CustomError(
      500,
      `${paymentAction} impossible - payment ${paymentId} is not associated with a cart.`
    );
  }
  return cart.body.results[0];
};

export const getOrder = async (paymentId: string, paymentAction: string) => {
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
    throw new CustomError(
      500,
      `${paymentAction} impossible - payment ${paymentId} is not associated with an order.`
    );
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
  extensionKey: string
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
  return extensions.length > 0 ? extensions[0] : undefined;
}

export const getPayPalExtensionUrl = async () => {
  const apiRoot = createApiRoot();
  const extensions = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${PAYPAL_PAYMENT_EXTENSION_KEY}"`,
      },
    })
    .execute();
  if (extensions.body.total !== 1)
    throw new CustomError(
      500,
      `Matching PayPal extension for the key ${PAYPAL_PAYMENT_EXTENSION_KEY} not found.`
    );
  else {
    const destination = extensions.body.results[0].destination;
    if ('url' in destination) return destination.url;
    else
      throw new CustomError(
        500,
        `Extension ${PAYPAL_PAYMENT_EXTENSION_KEY} is of ${destination.type} instead of expected HTTP type`
      );
  }
};
