import { PaymentReference } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import {handleCaptureOrderRequest, handleCreateOrderRequest} from '../service/payments.service';
import { logger } from '../utils/logger.utils';
import {UpdateActions} from "../types/index.types";

/**
 * Handle the update action
 *
 * @param {Resource} resource The resource from the request body
 * @returns {object}
 */
const update = async (resource: Resource) => {
  try {
    let updateActions: UpdateActions = [];
    const payment: PaymentReference = JSON.parse(JSON.stringify(resource));
    if (!payment.obj) {
      return;
    }
    logger.info(`Update payment with id ${payment.obj.id}`);
    updateActions = updateActions.concat(
        await handleCreateOrderRequest(payment.obj),
        await handleCaptureOrderRequest(payment.obj),
    );
    return { statusCode: 200, actions: updateActions };
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError(
        400,
        `Internal server error on CartController: ${error.stack}`
      );
    }
    throw new CustomError(400, JSON.stringify(error));
  }
};

/**
 * Handle the cart controller according to the action
 *
 * @param {string} action The action that comes with the request. Could be `Create` or `Update`
 * @param {Resource} resource The resource from the request body
 * @returns {Promise<object>} The data from the method that handles the action
 */
export const paymentController = async (action: string, resource: Resource) => {
  switch (action) {
    case 'Create':
      break;
    case 'Update':
      return await update(resource);
    default:
      throw new CustomError(
        500,
        `Internal Server Error - Resource not recognized. Allowed values are 'Create' or 'Update'.`
      );
  }
};
