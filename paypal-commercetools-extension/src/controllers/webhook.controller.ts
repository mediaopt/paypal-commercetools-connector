import { NextFunction, Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { VerifyWebhookSignature } from '../paypal/model-notifications-webhooks/verifyWebhookSignature';
import {
  handleAuthorizeWebhook,
  handleCaptureWebhook,
  handleOrderWebhook,
} from '../service/commercetools.service';
import { validateSignature } from '../service/paypal.service';
import { snakeToCamel } from '../utils/data.utils';
import { logger } from '../utils/logger.utils';

async function verifyWebhookSignature(request: Request) {
  const verificationRequest = {
    certUrl: request.header('paypal-cert-url') ?? '',
    authAlgo: request.header('paypal-auth-algo') ?? '',
    transmissionId: request.header('paypal-transmission-id') ?? '',
    transmissionSig: request.header('paypal-transmission-sig') ?? '',
    transmissionTime: new Date(
      request.header('paypal-transmission-time') ?? ''
    ),
    webhookEvent: request.body,
    webhookId: '3C785155UA8032035',
  };
  logger.info(
    JSON.stringify(
      await validateSignature(verificationRequest as VerifyWebhookSignature)
    )
  );
  // @TODO validate verifyWebhookSignature response
}

/**
 * Exposed service endpoint.
 * - Receives a POST request, parses the action and the controller
 * and returns it to the correct controller. We should be use 3. `Cart`, `Order` and `Payments`
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @param {NextFunction} next
 * @returns
 */
export const post = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info('Webhook called');
  await verifyWebhookSignature(request);
  const { resource_type, event_type, resource, summary } = request.body;
  try {
    logger.info(
      `Got ${event_type} for ${resource_type} with id ${resource.id}`
    );
    logger.info(summary);
    const data = snakeToCamel(resource);
    logger.info(JSON.stringify(data));
    if (!resource_type) {
      throw new CustomError(400, 'Bad request - Missing body parameters.');
    }
    switch (resource_type) {
      case 'capture':
        await handleCaptureWebhook(data);
        response.status(200).json({});
        return;
      case 'refund':
        // @TODO handle refund
        response.status(200).json({});
        return;
      case 'authorization':
        await handleAuthorizeWebhook(data);
        response.status(200).json({});
        return;
      case 'checkout-order':
        await handleOrderWebhook(data);
        response.status(200).json({});
        return;
      default:
        throw new CustomError(
          500,
          `Internal Server Error - Resource not recognized. Allowed resource_types are 'capture' and 'checkout-order'.`
        );
    }
  } catch (error) {
    logger.info('Error occured', error);
    if (error instanceof Error) {
      next(new CustomError(500, error.message));
    } else {
      next(error);
    }
  }
};
