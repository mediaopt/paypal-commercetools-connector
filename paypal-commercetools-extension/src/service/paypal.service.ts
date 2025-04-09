import axios, { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import qs from 'qs';
import CustomError from '../errors/custom.error';
import {
  OrderAuthorizeRequest,
  OrderCaptureRequest,
  OrderRequest,
  OrdersApi,
  OrderTrackerRequest,
  Patch,
  TrackersApi,
} from '../paypal/checkout_api';
import { Configuration } from '../paypal/configuration';
import {
  AuthorizationsApi,
  CaptureRequest,
  CapturesApi,
  RefundRequest,
} from '../paypal/payments_api';
import {
  PaymentTokenRequest,
  PaymentTokensApi,
  SetupTokenRequest,
  SetupTokensApi,
} from '../paypal/vault_api';
import {
  EventType,
  VerifyWebhookSignature,
  VerifyWebhookSignatureApi,
  WebhooksApi,
} from '../paypal/webhooks_api';
import { PAYPAL_EXTENSION_PATH } from '../routes/service.route';
import { PAYPAL_WEBHOOKS_PATH } from '../routes/webhook.route';
import { Order } from '../types/index.types';
import { logger } from '../utils/logger.utils';
import { cacheAccessToken, getCachedAccessToken } from './config.service';
import { getPayPalExtensionUrl } from './commercetools.service';

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

const getPayPalTrackersGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return new TrackersApi(await buildConfiguration(timeout));
};

const getPayPalVerifyWebhookSignatureGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new VerifyWebhookSignatureApi(await buildConfiguration(timeout));
};
const getPayPalWebhooksGateway = async (timeout = 0) => {
  return new WebhooksApi(await buildConfiguration(timeout));
};

const getPayPalAuhorizationsGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new AuthorizationsApi(await buildConfiguration(timeout));
};

const getPayPalCapturesGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return new CapturesApi(await buildConfiguration(timeout));
};

const getPayPalSetupTokenGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new SetupTokensApi(await buildConfiguration(timeout));
};

const getPayPalPaymentTokenGateway = async (
  timeout: number = TIMEOUT_PAYMENT
) => {
  return new PaymentTokensApi(await buildConfiguration(timeout));
};

export const createPayPalOrder = async (
  request: OrderRequest,
  clientMetadataId?: string
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersCreate(
    request,
    randomUUID(),
    undefined,
    clientMetadataId
  );
  return response.data;
};

export const authorizePayPalOrder = async (
  orderId: string,
  request: OrderAuthorizeRequest
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersAuthorize(
    orderId,
    randomUUID(),
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
  const response = await gateway.ordersPatch(orderId, request);
  if (response.status === 204) {
    return {
      status: 'success',
    };
  }
  return response.data;
};

export const getPayPalOrder = async (orderId: string) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersGet(orderId);
  return response.data as Order;
};

export const getPayPalCapture = async (captureId: string) => {
  const gateway = await getPayPalCapturesGateway();
  const response = await gateway.capturesGet(captureId, 'application/json');
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

export const voidPayPalAuthorization = async (authorizationId: string) => {
  const gateway = await getPayPalAuhorizationsGateway();
  const response = await gateway.authorizationsVoid(
    authorizationId,
    'application/json',
    undefined,
    'return=representation'
  );
  return response.data;
};

export const capturePayPalOrder = async (
  orderId: string,
  request: OrderCaptureRequest
) => {
  const gateway = await getPayPalOrdersGateway();
  const response = await gateway.ordersCapture(
    orderId,
    randomUUID(),
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
    }),
  };
  const response = await axios.request(options);

  if (response.status && response.status >= 200 && response.status <= 299) {
    const body = response.data;
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

export const generateUserIdToken = async (
  customerId?: string
): Promise<string> => {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new CustomError(
      500,
      'Internal Server Error - PayPal config is missing'
    );
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
      response_type: 'id_token',
      target_customer_id: customerId,
    }),
  };
  const response = await axios.request(options);
  if (response.status && response.status >= 200 && response.status <= 299) {
    return response.data.id_token;
  } else {
    throw new CustomError(response.status, response.statusText);
  }
};

export const createVaultSetupToken = async (request: SetupTokenRequest) => {
  const gateway = await getPayPalSetupTokenGateway(2000);
  const response = await gateway.setupTokensCreate(
    'application/json',
    randomUUID(),
    request
  );
  return response.data;
};

export const createPaymentToken = async (request: PaymentTokenRequest) => {
  const gateway = await getPayPalPaymentTokenGateway(2000);
  const response = await gateway.paymentTokensCreate(
    'application/json',
    randomUUID(),
    request
  );
  return response.data;
};

export const deletePaymentToken = async (paymentTokenId: string) => {
  const gateway = await getPayPalPaymentTokenGateway(2000);
  const response = await gateway.paymentTokensDelete(
    paymentTokenId,
    'application/json'
  );
  if (response.status === 204) {
    return {
      status: 'success',
    };
  }
  return response.data;
};

export const getPaymentTokens = async (customerId: string) => {
  const gateway = await getPayPalPaymentTokenGateway(2000);
  const response = await gateway.customerPaymentTokensGet(
    'application/json',
    customerId
  );
  return response.data;
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

export const createWebhook = async () => {
  const webhookId = await getWebhookId();
  if (webhookId) {
    return;
  }
  const gateway = await getPayPalWebhooksGateway();
  const response = await gateway.webhooksPost({
    url: await getWebhookUrl(),
    event_types: [
      {
        name: '*',
      } as EventType,
    ],
  });
  return response.data;
};

export const deleteWebhook = async () => {
  const gateway = await getPayPalWebhooksGateway();
  const webhookId = await getWebhookId();
  if (!webhookId) {
    return;
  }
  logger.info(`Deleting webhook with WebhookId ${webhookId}`);
  try {
    await gateway.webhooksDelete(webhookId);
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 404) {
      logger.info('Webhook is already deleted');
    } else {
      throw e;
    }
  }
};

export const getWebhookId = async () => {
  const webhookUrl = await getWebhookUrl();
  const gateway = await getPayPalWebhooksGateway();
  const webhooks = await gateway.webhooksList('APPLICATION');
  const webhook = webhooks.data.webhooks?.find(
    (webhook) => webhook.url === webhookUrl
  );
  return webhook?.id;
};

export const getWebhookUrl = async () => {
  try {
    const extensionUrl =
      process.env.CONNECT_SERVICE_URL ?? (await getPayPalExtensionUrl());
    return extensionUrl.replace(PAYPAL_EXTENSION_PATH, PAYPAL_WEBHOOKS_PATH);
  } catch (e) {
    logger.info('no webhook url identified');
    return '';
  }
};

export const addDeliveryData = async (
  orderId: string,
  request: OrderTrackerRequest
) => {
  const endpoint = await getPayPalOrdersGateway(TIMEOUT_PAYMENT);
  const response = await endpoint.ordersTrackCreate(orderId, request);
  return response.data;
};

export const updateDeliveryData = async (
  orderId: string,
  trackerId: string,
  request: Patch[]
) => {
  const endpoint = await getPayPalTrackersGateway(TIMEOUT_PAYMENT);
  const response = await endpoint.ordersTrackersPatch(
    orderId,
    trackerId,
    request
  );
  if (response.status === 204) {
    return {
      status: 'success',
    };
  }
  return response.data;
};
