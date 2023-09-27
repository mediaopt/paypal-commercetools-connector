import * as dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import express, { Express } from 'express';

// Import routes
import ServiceRoutes from './routes/service.route';

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
app.use('/paypal-commercetools-extension', ServiceRoutes);

// Global error handler
app.use(errorMiddleware);

// Listen the application
const server = app.listen(PORT, () => {
  logger.info(`⚡️ Service application listening on port ${PORT}`);
});

export default server;
