import { Router } from 'express';
import { post } from '../controllers/service.controller';

const payPalExtensionRouter: Router = Router();

payPalExtensionRouter.post('/', post);

export default payPalExtensionRouter;
