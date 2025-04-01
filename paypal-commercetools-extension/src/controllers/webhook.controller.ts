import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { VerifyWebhookSignature } from '../paypal/webhooks_api';
import {
  getPaymentByPayPalOrderId,
  handleAuthorizeWebhook,
  handleCaptureWebhook,
  handleOrderWebhook,
  handlePaymentTokenWebhook,
} from '../service/commercetools.service';
import { getWebhookId, validateSignature } from '../service/paypal.service';
import { logger } from '../utils/logger.utils';

async function verifyWebhookSignature(request: Request, storeKey?: string) {
  const webhookId = await getWebhookId({ storeKey });
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
  const response = await validateSignature(verificationRequest, storeKey);
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
      `Got ${event_type} for ${resource_type} with id ${resource.id}`
    );
    logger.info(summary);
    let orderId: string;

    switch (resource_type) {
      case 'capture':
      case 'authorization': {
        orderId = resource.supplementary_data?.related_ids?.order_id ?? '';
        break;
      }
      case 'checkout-order': {
        orderId = resource.id ?? '';
        break;
      }
      case 'payment_token': {
        orderId = resource.metadata.order_id;
        break;
      }
      default:
        orderId = '';
    }

    const payment = await getPaymentByPayPalOrderId(orderId);
    const storeKey = payment?.custom?.fields?.storeKey;

    await verifyWebhookSignature(request, storeKey);

    logger.info(JSON.stringify(resource));
    if (!resource_type) {
      throw new CustomError(400, 'Bad request - Missing body parameters.');
    }
    switch (resource_type) {
      case 'capture':
        await handleCaptureWebhook(resource, payment, event_type);
        response.status(200).json({});
        return;
      case 'refund':
        // @TODO handle refund
        response.status(200).json({});
        return;
      case 'authorization':
        await handleAuthorizeWebhook(resource, payment);
        response.status(200).json({});
        return;
      case 'checkout-order':
        await handleOrderWebhook(resource, payment);
        response.status(200).json({});
        return;
      case 'payment_token':
        await handlePaymentTokenWebhook(resource, payment);
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
