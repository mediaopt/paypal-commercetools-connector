import * as dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import express, { Express } from 'express';

// Import routes
import ServiceRoutes, { PAYPAL_EXTENSION_PATH } from './routes/service.route';
import PayPalWebhookRouter, {
  PAYPAL_WEBHOOKS_PATH,
} from './routes/webhook.route';

// Import logger
import { logger } from './utils/logger.utils';

import { errorMiddleware } from './middleware/error.middleware';
import { readConfiguration } from './utils/config.utils';

// Read env variables
readConfiguration();

const PORT = 8080;

// Create the express app
const app: Express = express();

// Define configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use(PAYPAL_EXTENSION_PATH, ServiceRoutes);
app.use(PAYPAL_WEBHOOKS_PATH, PayPalWebhookRouter);

// Global error handler
app.use(errorMiddleware);

// Listen the application
const server = app.listen(PORT, () => {
  logger.info(`⚡️ Service application listening on port ${PORT}`);
});

export default server;
