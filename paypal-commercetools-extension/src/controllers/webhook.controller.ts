import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { VerifyWebhookSignature } from '../paypal/webhooks_api';
import {
  handleAuthorizeWebhook,
  handleCaptureWebhook,
  handleOrderWebhook,
} from '../service/commercetools.service';
import { validateSignature } from '../service/paypal.service';
import { logger } from '../utils/logger.utils';

async function verifyWebhookSignature(request: Request) {
  const verificationRequest: VerifyWebhookSignature = {
    cert_url: request.header('paypal-cert-url') ?? '',
    auth_algo: request.header('paypal-auth-algo') ?? '',
    transmission_id: request.header('paypal-transmission-id') ?? '',
    transmission_sig: request.header('paypal-transmission-sig') ?? '',
    transmission_time: request.header('paypal-transmission-time') ?? '',
    webhook_event: request.body,
    webhook_id: '3C785155UA8032035',
  };
  const response = await validateSignature(verificationRequest);
  logger.info(JSON.stringify(response));
  if (response.verification_status !== 'SUCCESS') {
    throw new CustomError(400, 'Verification failed');
  }
}

/**
 * Exposed service endpoint.
 * - Receives a POST request, parses the action and the controller
 * and returns it to the correct controller. We should be use 3. `Cart`, `Order` and `Payments`
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (
  request: Request,
  response: Response
) => {
  logger.info('Webhook called');
  await verifyWebhookSignature(request);
  const { resource_type, event_type, resource, summary } = request.body;
  try {
    logger.info(
      `Got ${event_type} for ${resource_type} with id ${resource.id}`
    );
    logger.info(summary);
    logger.info(JSON.stringify(resource));
    if (!resource_type) {
      throw new CustomError(400, 'Bad request - Missing body parameters.');
    }
    switch (resource_type) {
      case 'capture':
        await handleCaptureWebhook(resource);
        response.status(200).json({});
        return;
      case 'refund':
        // @TODO handle refund
        response.status(200).json({});
        return;
      case 'authorization':
        await handleAuthorizeWebhook(resource);
        response.status(200).json({});
        return;
      case 'checkout-order':
        await handleOrderWebhook(resource);
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

    response.status(200).json({});
    return;
  }
};
