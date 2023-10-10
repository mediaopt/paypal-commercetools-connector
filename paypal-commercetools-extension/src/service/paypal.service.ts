import CustomError from '../errors/custom.error';
import { OrdersApi } from '../paypal/api/ordersApi';

import { randomUUID } from 'crypto';
import request from 'request';
import { AuthorizationsApi } from '../paypal/api/authorizationsApi';
import { OrderAuthorizeRequest } from '../paypal/model-checkout-orders/orderAuthorizeRequest';
import { OrderCaptureRequest } from '../paypal/model-checkout-orders/orderCaptureRequest';
import { OrderRequest } from '../paypal/model-checkout-orders/orderRequest';
import { Patch } from '../paypal/model-checkout-orders/patch';
import { CaptureRequest } from '../paypal/model-payments-payment/captureRequest';
import { logger } from '../utils/logger.utils';
import { cacheAccessToken, getCachedAccessToken } from './config.service';

const PAYPAL_API_SANDBOX = 'https://api-m.sandbox.paypal.com';
const PAYPAL_API_LIVE = 'https://api-m.paypal.com';
const PAYPAL_PARTNER_ATTRIBUTION_ID = 'commercetoolsGmbH_SP_PPCP';

const TIMEOUT_PAYMENT = 9500;

function getPayPalPartnerAttributionHeader() {
  return {
    'PayPal-Partner-Attribution-Id': PAYPAL_PARTNER_ATTRIBUTION_ID,
  };
}

async function initializeGateway(
  gateway: OrdersApi | AuthorizationsApi,
  timeout: number
) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new CustomError(
      500,
      'Internal Server Error - braintree config is missing'
    );
  }
  const token = await generateAccessToken();
  logger.info(JSON.stringify(token));
  gateway.accessToken = token;
  gateway.addInterceptor(function (options) {
    options.timeout = timeout;
    if (options.headers) {
      options.headers = {
        ...options.headers,
        ...getPayPalPartnerAttributionHeader(),
      };
    }
  });
  return gateway;
}

const getPayPalOrdersGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return (await initializeGateway(
    new OrdersApi(getAPIEndpoint()),
    timeout
  )) as OrdersApi;
};

const getPayPalAuhorizationsGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return (await initializeGateway(
    new AuthorizationsApi(getAPIEndpoint()),
    timeout
  )) as AuthorizationsApi;
};

export const createPayPalOrder = async (request: OrderRequest) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersCreate(
    randomUUID(),
    'application/json',
    request
  );
  return response.body;
};

export const authorizePayPalOrder = async (
  orderId: string,
  request: OrderAuthorizeRequest
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersAuthorize(
    randomUUID(),
    orderId,
    'application/json',
    undefined,
    undefined,
    undefined,
    request
  );
  return response.body;
};

export const updatePayPalOrder = async (
  orderId: string,
  request: Array<Patch>
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersPatch(
    orderId,
    'application/json',
    request
  );
  if (response.response.statusCode === 204) {
    return {
      status: 'success',
    };
  }
  return response.response;
};

export const getPayPalOrder = async (orderId: string) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersGet(orderId, 'application/json');
  return response.body;
};

export const capturePayPalAuthorization = async (
  authorizationId: string,
  request: CaptureRequest
) => {
  const gateway = await getPayPalAuhorizationsGateway();
  const response = await gateway.authorizationsCapture(
    authorizationId,
    randomUUID(),
    'application/json',
    undefined,
    request
  );
  return response.body;
};

export const capturePayPalOrder = async (
  orderId: string,
  request: OrderCaptureRequest
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersCapture(
    randomUUID(),
    orderId,
    'application/json',
    undefined,
    undefined,
    undefined,
    request
  );
  return response.body;
};

export async function getClientToken() {
  const token = await generateAccessToken();
  const options = {
    method: 'POST',
    url: `${getAPIEndpoint()}/v1/identity/generate-token`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...getPayPalPartnerAttributionHeader(),
    },
  };
  return new Promise<string>((resolve, reject) => {
    request(options, function (error: Error, response: request.Response) {
      if (error) reject(error);
      if (
        response.statusCode &&
        response.statusCode >= 200 &&
        response.statusCode <= 299
      ) {
        const body = JSON.parse(response.body);
        resolve(body['client_token']);
      } else {
        reject(new CustomError(response.statusCode, response.statusMessage));
      }
    });
  });
}

const generateAccessToken = async (): Promise<string> => {
  const cachedToken = await getCachedAccessToken();
  if (
    cachedToken?.value &&
    cachedToken.value.validUntil > new Date().toISOString()
  ) {
    logger.debug('Using cached token');
    return cachedToken.value.accessToken;
  }
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const options = {
    method: 'POST',
    url: `${getAPIEndpoint()}/v1/oauth2/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
      ...getPayPalPartnerAttributionHeader(),
    },
    form: {
      grant_type: 'client_credentials',
      ignoreCache: 'true',
      return_authn_schemes: 'true',
      return_client_metadata: 'true',
      return_unconsented_scopes: 'true',
    },
  };
  return new Promise<string>((resolve, reject) => {
    request(options, function (error: Error, response: request.Response) {
      if (error) reject(error);
      if (
        response.statusCode &&
        response.statusCode >= 200 &&
        response.statusCode <= 299
      ) {
        const body = JSON.parse(response.body);
        cacheAccessToken(
          {
            accessToken: body['access_token'],
            validUntil: new Date(
              new Date().getTime() + body['expires_in'] * 1000
            ),
          },
          cachedToken?.version ?? 0
        );
        resolve(body['access_token']);
      } else {
        reject(new CustomError(response.statusCode, response.statusMessage));
      }
    });
  });
};

const getAPIEndpoint = () => {
  return process.env.PAYPAL_ENVIRONMENT === 'Production'
    ? PAYPAL_API_LIVE
    : PAYPAL_API_SANDBOX;
};
