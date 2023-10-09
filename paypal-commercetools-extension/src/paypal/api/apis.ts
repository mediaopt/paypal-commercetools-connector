export { RequestFile } from '../model-checkout-orders/models';
export * from './authorizationsApi';
export * from './capturesApi';
export * from './ordersApi';
export * from './refundsApi';
export * from './trackersApi';
import * as http from 'http';
import { AuthorizationsApi } from './authorizationsApi';
import { CapturesApi } from './capturesApi';
import { OrdersApi } from './ordersApi';
import { RefundsApi } from './refundsApi';
import { TrackersApi } from './trackersApi';

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
];
