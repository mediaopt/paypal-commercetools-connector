import { AxiosError } from 'axios';
import { PAYPAL_PAYMENT_INTERACTION_TYPE_KEY } from '../connector/actions';
import { ErrorDetails } from '../paypal/checkout_api';
import { StringOrObject, UpdateActions } from '../types/index.types';
import { getCurrentTimestamp, stringifyData } from './data.utils';
import { logger } from './logger.utils';

const errorDetailsMapping = {
  PAYMENT_SOURCE_DECLINED_BY_PROCESSOR: 'paymentSourceDeclined',
  PAYMENT_SOURCE_CANNOT_BE_USED: 'paymentSourceDeclined',
  PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED: 'paymentSourceNotVerified',
  SHIPPING_ADDRESS_INVALID: 'paymentSourceNotVerified',
  BILLING_ADDRESS_INVALID: 'paymentSourceNotVerified',
  INVALID_COUNTRY_CODE: 'paymentSourceNotVerified',
  POSTAL_CODE_REQUIRED: 'paymentSourceNotVerified',
};

export const handleRequest = (
  requestName: string,
  request: StringOrObject,
  skipRemoveEmptyProperties = false,
  isPayment = true
): UpdateActions => {
  const updateActions: UpdateActions = [];
  if (typeof request === 'object' && !skipRemoveEmptyProperties) {
    removeEmptyProperties(request);
  }
  if (isPayment) {
    updateActions.push({
      action: 'addInterfaceInteraction',
      type: {
        typeId: 'type',
        key: PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
      },
      fields: {
        type: `${requestName}Request`,
        data: stringifyData(request),
        timestamp: getCurrentTimestamp(),
      },
    });
  }
  logger.info(`${requestName} request: ${stringifyData(request)}`);
  return updateActions;
};

export const handlePaymentResponse = (
  requestName: string,
  response: StringOrObject,
  transactionId?: string
): UpdateActions => {
  const updateActions: UpdateActions = [];
  if (typeof response === 'object') {
    removeEmptyProperties(response);
  }
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Response`,
    value: stringifyData(response),
  });
  updateActions.push({
    action: 'addInterfaceInteraction',
    type: {
      typeId: 'type',
      key: PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
    },
    fields: {
      type: `${requestName}Response`,
      data: stringifyData(response),
      timestamp: getCurrentTimestamp(),
    },
  });
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Request`,
    value: null,
  });
  return updateActions;
};

export const handleCustomerResponse = (
  requestName: string,
  response: StringOrObject
): UpdateActions => {
  const updateActions: UpdateActions = [];
  if (typeof response === 'object') {
    removeEmptyProperties(response);
  }
  updateActions.push({
    action: 'setCustomField',
    name: `${requestName}Response`,
    value: stringifyData(response),
  });
  updateActions.push({
    action: 'setCustomField',
    name: `${requestName}Request`,
    value: null,
  });
  return updateActions;
};

export const removeEmptyProperties = (response: any) => {
  for (const prop in response) {
    if (response[prop] === null) {
      delete response[prop];
    }
    if (typeof response[prop] === 'object') {
      removeEmptyProperties(response[prop]);
      if (Object.keys(response[prop]).length === 0) {
        delete response[prop];
      }
    }
  }
};

function parseErrorMessage(error: any, requestName: string) {
  const details =
    error?.response?.data?.details?.map(
      (details: ErrorDetails) => details.issue
    ) ?? [];
  if (requestName === 'createPayPalOrder') {
    for (const detail of details) {
      const indexOfDetail = Object.keys(errorDetailsMapping).indexOf(detail);
      if (indexOfDetail !== -1) {
        return {
          message: Object.values(errorDetailsMapping)[indexOfDetail],
          details: undefined,
        };
      }
    }
    return { message: 'OTHER', details: undefined };
  }
  const errorMessage =
    error instanceof AxiosError
      ? `${error.message} (${error?.response?.data?.message}) (paypalDebugId: ${error?.response?.headers['paypal-debug-id']})`
      : error instanceof Error && 'message' in error
      ? error.message
      : 'Unknown error';

  return { message: errorMessage, details };
}

export const handleError = (
  requestName: string,
  error: any,
  transactionId?: string
): UpdateActions => {
  const payPalDebugId =
    error instanceof AxiosError
      ? error?.response?.headers['paypal-debug-id']
      : undefined;
  logger.error(
    `Call to ${requestName} resulted in an error` +
      (payPalDebugId ? ` (paypalDebugId: ${payPalDebugId})` : ''),
    error?.response?.data ?? error
  );
  const { message, details } = parseErrorMessage(error, requestName);
  const updateActions: UpdateActions = [];
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Response`,
    value: JSON.stringify({ success: false, message, details }),
  });
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Request`,
    value: null,
  });
  return updateActions;
};
