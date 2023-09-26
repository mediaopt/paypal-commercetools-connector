import { PAYPAL_PAYMENT_INTERACTION_TYPE_KEY } from '../connector/actions';
import { HttpError } from '../paypal/api/apis';
import { StringOrObject, UpdateActions } from '../types/index.types';
import { getCurrentTimestamp, stringifyData } from './data.utils';
import { logger } from './logger.utils';

export const handleRequest = (
  requestName: string,
  request: StringOrObject
): UpdateActions => {
  const updateActions: UpdateActions = [];
  if (typeof request === 'object') {
    removeEmptyProperties(request);
  }
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

export const handleError = (
  requestName: string,
  error: unknown,
  transactionId?: string
): UpdateActions => {
  const errorMessage =
    error instanceof HttpError
      ? `${error.body.message}: ${error.body.details[0].description ?? ''}`
      : error instanceof Error && 'message' in error
      ? error.message
      : 'Unknown error';
  const updateActions: UpdateActions = [];
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Response`,
    value: JSON.stringify({ success: false, message: errorMessage }),
  });
  updateActions.push({
    action: transactionId ? 'setTransactionCustomField' : 'setCustomField',
    transactionId: transactionId,
    name: `${requestName}Request`,
    value: null,
  });
  return updateActions;
};
