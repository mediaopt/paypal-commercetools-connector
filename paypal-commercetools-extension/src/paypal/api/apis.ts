export { RequestFile } from '../model/models';
export * from './ordersApi';
export * from './trackersApi';
import * as http from 'http';
import { OrdersApi } from './ordersApi';
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

export const APIS = [OrdersApi, TrackersApi];
