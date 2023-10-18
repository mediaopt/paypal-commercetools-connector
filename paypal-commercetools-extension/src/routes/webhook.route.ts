import { Router } from 'express';
import { post } from '../controllers/webhook.controller';

const payPalWebhookRouter: Router = Router();

payPalWebhookRouter.post('/', post);

export default payPalWebhookRouter;
