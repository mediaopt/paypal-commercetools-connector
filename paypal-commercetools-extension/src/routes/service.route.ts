import { Router } from 'express';
import { post } from '../controllers/service.controller';

export const PAYPAL_EXTENSION_PATH = '/paypal-commercetools-extension';

const payPalExtensionRouter: Router = Router();

payPalExtensionRouter.post('/', post);

export default payPalExtensionRouter;
