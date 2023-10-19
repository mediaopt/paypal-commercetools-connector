export { RequestFile } from '../model-checkout-orders/models';
export * from './authorizationsApi';
export * from './capturesApi';
export * from './ordersApi';
export * from './refundsApi';
export * from './simulateEventApi';
export * from './trackersApi';
export * from './verifyWebhookSignatureApi';
export * from './webhooksApi';
export * from './webhooksEventsApi';
export * from './webhooksEventTypesApi';
export * from './webhooksLookupApi';
import * as http from 'http';
import { AuthorizationsApi } from './authorizationsApi';
import { CapturesApi } from './capturesApi';
import { OrdersApi } from './ordersApi';
import { RefundsApi } from './refundsApi';
import { SimulateEventApi } from './simulateEventApi';
import { TrackersApi } from './trackersApi';
import { VerifyWebhookSignatureApi } from './verifyWebhookSignatureApi';
import { WebhooksApi } from './webhooksApi';
import { WebhooksEventsApi } from './webhooksEventsApi';
import { WebhooksEventTypesApi } from './webhooksEventTypesApi';
import { WebhooksLookupApi } from './webhooksLookupApi';

export class HttpError extends Error {
  constructor(
    public response: http.IncomingMessage,
    public body: any,
    public statusCode?: number
  ) {
    super('HTTP request failed');
    this.name = 'HttpError';
  }
}

export const APIS = [
  OrdersApi,
  TrackersApi,
  AuthorizationsApi,
  CapturesApi,
  RefundsApi,
  SimulateEventApi,
  VerifyWebhookSignatureApi,
  WebhooksApi,
  WebhooksEventTypesApi,
  WebhooksEventsApi,
  WebhooksLookupApi,
];
