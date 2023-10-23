import axios from 'axios';
import { randomUUID } from 'crypto';
import qs from 'qs';
import CustomError from '../errors/custom.error';
import {
  OrderAuthorizeRequest,
  OrderCaptureRequest,
  OrderRequest,
  OrdersApi,
  Patch,
} from '../paypal/checkout_api';
import { Configuration } from '../paypal/configuration';
import {
  AuthorizationsApi,
  CaptureRequest,
  CapturesApi,
  RefundRequest,
} from '../paypal/payments_api';
import {
  VerifyWebhookSignature,
  VerifyWebhookSignatureApi,
} from '../paypal/webhooks_api';
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

async function buildConfiguration(timeout: number) {
  return new Configuration({
    basePath: getAPIEndpoint(),
    baseOptions: {
      timeout: timeout,
      headers: getPayPalPartnerAttributionHeader(),
    },
    accessToken: await generateAccessToken(),
  });
}

const getPayPalOrdersGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return new OrdersApi(await buildConfiguration(timeout));
};

const getPayPalVerifyWebhookSignatureGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new VerifyWebhookSignatureApi(await buildConfiguration(timeout));
};

const getPayPalAuhorizationsGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new AuthorizationsApi(await buildConfiguration(timeout));
};

const getPayPalCapturesGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return new CapturesApi(await buildConfiguration(timeout));
};

export const createPayPalOrder = async (request: OrderRequest) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersCreate(
    randomUUID(),
    'application/json',
    request
  );
  return response.data;
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
  return response.data;
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
  if (response.status === 204) {
    return {
      status: 'success',
    };
  }
  return response.data;
};

export const getPayPalOrder = async (orderId: string) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersGet(orderId, 'application/json');
  return response.data;
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
    'return=representation',
    request
  );
  return response.data;
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
    'return=representation',
    undefined,
    undefined,
    request
  );
  return response.data;
};

export const refundPayPalOrder = async (
  captureId: string,
  request?: RefundRequest
) => {
  const gateway = await getPayPalCapturesGateway();
  const response = await gateway.capturesRefund(
    captureId,
    randomUUID(),
    'application/json',
    'return=representation',
    undefined,
    request
  );
  return response.data;
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
  const response = await axios.request(options);
  if (response.status && response.status >= 200 && response.status <= 299) {
    return response.data.client_token;
  } else {
    throw new CustomError(response.status, response.statusText);
  }
}

const generateAccessToken = async (): Promise<string> => {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new CustomError(
      500,
      'Internal Server Error - PayPal config is missing'
    );
  }
  const cachedToken = await getCachedAccessToken();
  if (
    cachedToken?.value &&
    cachedToken.value.validUntil > new Date().toISOString()
  ) {
    logger.info('Using cached token');
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
    data: qs.stringify({
      grant_type: 'client_credentials',
      ignoreCache: 'true',
      return_authn_schemes: 'true',
      return_client_metadata: 'true',
      return_unconsented_scopes: 'true',
    }),
  };
  const response = await axios.request(options);
  if (response.status && response.status >= 200 && response.status <= 299) {
    const body = JSON.parse(response.data);
    await cacheAccessToken(
      {
        accessToken: body.access_token,
        validUntil: new Date(new Date().getTime() + body.expires_in * 1000),
      },
      cachedToken?.version ?? 0
    );
    logger.info(body.access_token);
    return body.access_token;
  } else {
    throw new CustomError(response.status, response.statusText);
  }
};

export const validateSignature = async (signature: VerifyWebhookSignature) => {
  const gateway = await getPayPalVerifyWebhookSignatureGateway(0);
  const response = await gateway.verifyWebhookSignaturePost(signature);
  return response.data;
};

const getAPIEndpoint = () => {
  return process.env.PAYPAL_ENVIRONMENT === 'Production'
    ? PAYPAL_API_LIVE
    : PAYPAL_API_SANDBOX;
};
