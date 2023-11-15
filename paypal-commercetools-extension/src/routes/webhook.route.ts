import { Router } from 'express';
import { post } from '../controllers/webhook.controller';

const payPalWebhookRouter: Router = Router();

export const PAYPAL_WEBHOOKS_PATH = '/paypal-webhooks/';

payPalWebhookRouter.post('/', post);

export default payPalWebhookRouter;
