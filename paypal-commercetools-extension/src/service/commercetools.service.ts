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
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
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
    const detailedErrorMessage = `${paymentAction} action impossible - there is not any assigned commercetools payment for the PayPal order id ${orderId}`;
    logger.error(`detailedErrorMessage`);
    throw new CustomError(400, `Bad request: ${detailedErrorMessage}`);
  }

  logger.info(
    `For the PayPal order found assigned commercetools payment with id ${results[0].id}`
  );
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
    logger.info(`Creating new transaction for payment ${payment.id}`);
    return [
      {
        action: 'addTransaction',
        transaction: transactionDraft,
      } as PaymentAddTransactionAction,
    ];
  }
  if (commercetoolsTransactions[0].state === transactionDraft.state) {
    logger.info(
      `Payment ${payment.id} transaction ${commercetoolsTransactions[0].id} is already up to date in a state ${commercetoolsTransactions[0].state}. No transaction update action required.`
    );
    return [];
  }
  logger.info(
    `For payment ${payment.id} changing state from ${commercetoolsTransactions[0].state} to ${transactionDraft.state}`
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
  const maxAttempts = 5;
  const delayBetweenAttemptsMs = TIMEOUT_PAYMENT / maxAttempts;
  let currentAttempt = 0;
  let cartFetched = false;
  while (currentAttempt < maxAttempts && !cartFetched) {
    try {
      const cart = await getCart(paymentId, paymentAction);
      cartFetched = true;
      logger.info(
        `WaitForCart: Successfully fetched cart for payment ${paymentId} on attempt ${
          currentAttempt + 1
        }.`
      );
      return cart;
    } catch (error) {
      currentAttempt++;
      if (currentAttempt >= maxAttempts) {
        throw new CustomError(
          500,
          `WaitForCart: Unable to fetch cart for payment ${paymentId} after ${maxAttempts} attempts.`
        );
      }
      logger.info(
        `WaitForCart: Attempt ${currentAttempt} failed to fetch cart for payment ${paymentId}. Retrying in ${delayBetweenAttemptsMs}ms...`
      );
      await sleep(delayBetweenAttemptsMs);
    }
  }
  throw new CustomError(
    500,
    `WaitForCart: Unable to fetch cart for payment ${paymentId}.`
  );
};

export const handlePaymentTokenWebhook = async (
  resource: PayPalVaultPaymentTokenResource
) => {
  if (!resource?.customer?.id) {
    return;
  }

  const orderId = resource.metadata.order_id;
  const payment = await getPaymentByPayPalOrderId(
    orderId,
    'PayPalPaymentTokenWebhook'
  );
  const cart = await waitForCart(payment.id, 'PayPalPaymentTokenWebhook');
  const customer = await getCustomerByCart(cart);
  if (!customer) {
    logger.info(
      `PayPalPaymentTokenWebhook action is not possible - no customer found for cart ${cart.id}`
    );
    return;
  }
  const payPalCustomerId = resource.customer.id;
  const storedPayPalCustomerId = customer?.custom?.fields?.PayPalUserId;
  if (storedPayPalCustomerId !== payPalCustomerId) {
    logger.info(
      `Changing PayPalUserId to ${payPalCustomerId} for ${customer.email} within PayPalPaymentTokenWebhook scope`
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
  const order = await getPayPalOrder(orderId);
  const payment = await getPaymentByPayPalOrderId(
    orderId,
    'CheckoutOrderWebhook'
  );
  const updateActions = updatePaymentFields(order);
  if (!isPaymentUpToDate(payment, updateActions)) {
    logger.info(
      `Payment ${payment.id} is outdated, performing update within CheckoutOrderWebhook scope, previous state: ${payment.paymentStatus.interfaceCode}`
    );
    await handleUpdatePayment(payment.id, payment.version, updateActions);
  } else
    logger.info(
      `Payment ${payment.id} is already up to date, no update action required within CheckoutOrderWebhook scope`
    );
};

export const handleCaptureWebhook = async (
  resource: Capture2,
  eventType: string
) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const payPalOrder = await getPayPalOrder(orderId);
  const payUponInvoiceSource = payPalOrder?.payment_source?.pay_upon_invoice;

  if (!(payUponInvoiceSource && eventType === 'PAYMENT.CAPTURE.COMPLETED')) {
    await sleep(TIMEOUT_PAYMENT); //this prevents concurrent modification occurring if webhook and capturePayPalOrder try to change the status simultaneously, PayUponInvoice works different, see https://developer.paypal.com/docs/checkout/apm/pay-upon-invoice/integrate-pui-merchant/
  }

  const payment = await getPaymentByPayPalOrderId(
    orderId,
    'CapturePayPalOrderWebhook'
  );

  if (payUponInvoiceSource && eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const settings = await getSettings();
    let customerEmail = payUponInvoiceSource.email;
    if (!customerEmail) {
      const order = await getOrder(payment.id, 'CapturePayPalOrderWebhook');
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

  const { payment_source, status } = await getPayPalOrder(orderId);
  if (
    !(
      status === 'COMPLETED' &&
      payment.paymentStatus.interfaceCode === 'COMPLETED' &&
      payment.paymentStatus.interfaceText === 'COMPLETED' &&
      payment_source &&
      payment.paymentMethodInfo.method ===
        mapPayPalPaymentSourceToCommercetoolsMethodInfo(payment_source)
    )
  ) {
    updateActions = updateActions.concat(
      updatePaymentFields({ payment_source, status })
    );
  }

  if (updateActions.length) {
    logger.info(
      `Fallback webhook processing required for payment ${payment.id}: transaction or payment status out of sync`
    );
    await handleUpdatePayment(payment.id, payment.version, updateActions);
  } else {
    logger.info(
      `No update actions required within the webhook call for payment ${payment.id}, both transaction and payment statuses are already up to date`
    );
  }
};

export const handleAuthorizeWebhook = async (resource: Authorization2) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
  const authorizationType =
    resource.status === 'VOIDED' ? 'CancelAuthorization' : 'Authorization';
  const payment = await getPaymentByPayPalOrderId(
    orderId,
    `${authorizationType}PayPalOrderWebhook`
  );

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
      const detailedErrorMessage = `Error in updating commercetools payment with id ${paymentId} and version ${paymentVersion}`;
      logger.error(detailedErrorMessage);
      throw new CustomError(400, detailedErrorMessage);
    }
    return payment;
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
