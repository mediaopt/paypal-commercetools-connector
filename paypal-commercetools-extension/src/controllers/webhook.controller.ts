import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { VerifyWebhookSignature } from '../paypal/webhooks_api';
import {
  handleAuthorizeWebhook,
  handleCaptureWebhook,
  handleOrderWebhook,
  handlePaymentTokenWebhook,
} from '../service/commercetools.service';
import { getWebhookId, validateSignature } from '../service/paypal.service';
import { logger } from '../utils/logger.utils';

async function verifyWebhookSignature(request: Request) {
  const webhookId = await getWebhookId();
  if (!webhookId) {
    throw new CustomError(500, 'WebhookId is missing');
  }
  const verificationRequest: VerifyWebhookSignature = {
    cert_url: request.header('paypal-cert-url') ?? '',
    auth_algo: request.header('paypal-auth-algo') ?? '',
    transmission_id: request.header('paypal-transmission-id') ?? '',
    transmission_sig: request.header('paypal-transmission-sig') ?? '',
    transmission_time: request.header('paypal-transmission-time') ?? '',
    webhook_event: request.body,
    webhook_id: webhookId,
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
export const post = async (request: Request, response: Response) => {
  try {
    logger.info('Webhook called');
    const { resource_type, event_type, resource, summary } = request.body;
    logger.info(
      `Got webhook called with ${event_type} for ${resource_type} with id ${resource.id}. Summary: ${summary}`
    );
    await verifyWebhookSignature(request);
    if (!resource_type) {
      throw new CustomError(
        400,
        'Bad request - Missing body parameters: webhook called without resource_type.'
      );
    }
    switch (resource_type) {
      case 'capture':
        await handleCaptureWebhook(resource, event_type);
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
      case 'payment_token':
        await handlePaymentTokenWebhook(resource);
        response.status(200).json({});
        return;
      default:
        throw new CustomError(
          500,
          `Internal Server Error - Resource not recognized. Expected values for resource_type are: 'capture', 'checkout-order', 'refund','authorization' and 'payment_token'. Received resource_type ${resource_type} with id ${resource.id} and event ${event_type}`
        );
    }
  } catch (error) {
    logger.info('Error occurred', error);

    response.status(200).json({});
    return;
  }
};
