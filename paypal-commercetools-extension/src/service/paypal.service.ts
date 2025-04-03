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

const PAYPAL_API_SANDBOX = 'https://api-m.sandbox.paypal.com';
const PAYPAL_API_LIVE = 'https://api-m.paypal.com';
const PAYPAL_PARTNER_ATTRIBUTION_ID = 'commercetoolsGmbH_SP_PPCP';

const timeouts = {
  payment: 9500,
  extension: 2000,
  payPal: 0,
};

type timeoutType = keyof typeof timeouts;

const setTimeout = (specialTimeout?: timeoutType) =>
  specialTimeout ? timeouts[specialTimeout] : timeouts.payment;

function getPayPalPartnerAttributionHeader() {
  return {
    'PayPal-Partner-Attribution-Id': PAYPAL_PARTNER_ATTRIBUTION_ID,
  };
}

type MultiTenantConfig = { storeKey?: string; token?: string };

async function buildConfiguration(
  multiTenantConfig?: MultiTenantConfig,
  timeout?: timeoutType
) {
  return new Configuration({
    basePath: getAPIEndpoint(),
    baseOptions: {
      timeout: setTimeout(timeout),
      headers: getPayPalPartnerAttributionHeader(),
    },
    accessToken:
      multiTenantConfig?.token ??
      (await generateAccessToken(multiTenantConfig?.storeKey)),
  });
}

const getPayPalOrdersGateway = async (storeKey?: string) => {
  return new OrdersApi(await buildConfiguration({ storeKey }));
};

const getPayPalTrackersGateway = async (storeKey?: string) => {
  return new TrackersApi(await buildConfiguration({ storeKey }));
};

const getPayPalVerifyWebhookSignatureGateway = async (storeKey?: string) => {
  return new VerifyWebhookSignatureApi(await buildConfiguration({ storeKey }));
};
const getPayPalWebhooksGateway = async (
  multiTenantConfig?: MultiTenantConfig
) => {
  return new WebhooksApi(await buildConfiguration(multiTenantConfig, 'payPal'));
};

const getPayPalAuhorizationsGateway = async (storeKey?: string) => {
  return new AuthorizationsApi(await buildConfiguration({ storeKey }));
};

const getPayPalCapturesGateway = async (storeKey?: string) => {
  return new CapturesApi(await buildConfiguration({ storeKey }));
};

const getPayPalSetupTokenGateway = async (storeKey?: string) => {
  return new SetupTokensApi(
    await buildConfiguration({ storeKey }, 'extension')
  );
};

const getPayPalPaymentTokenGateway = async (storeKey?: string) => {
  return new PaymentTokensApi(
    await buildConfiguration({ storeKey }, 'extension')
  );
};

export const createPayPalOrder = async (
  request: OrderRequest,
  storeKey?: string,
  clientMetadataId?: string
) => {
  const gateway = await getPayPalOrdersGateway(storeKey);
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
  request: OrderAuthorizeRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalOrdersGateway(storeKey);
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
  request: Array<Patch>,
  storeKey?: string
) => {
  const gateway = await getPayPalOrdersGateway(storeKey);
  const response = await gateway.ordersPatch(orderId, request);
  if (response.status === 204) {
    return {
      status: 'success',
    };
  }
  return response.data;
};

export const getPayPalOrder = async (orderId: string, storeKey?: string) => {
  const gateway = await getPayPalOrdersGateway(storeKey);
  const response = await gateway.ordersGet(orderId);
  return response.data as Order;
};

export const getPayPalCapture = async (
  captureId: string,
  storeKey?: string
) => {
  const gateway = await getPayPalCapturesGateway(storeKey);
  const response = await gateway.capturesGet(captureId, 'application/json');
  return response.data;
};

export const capturePayPalAuthorization = async (
  authorizationId: string,
  request: CaptureRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalAuhorizationsGateway(storeKey);
  const response = await gateway.authorizationsCapture(
    authorizationId,
    randomUUID(),
    'application/json',
    'return=representation',
    request
  );
  return response.data;
};

export const voidPayPalAuthorization = async (
  authorizationId: string,
  storeKey?: string
) => {
  const gateway = await getPayPalAuhorizationsGateway(storeKey);
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
  request: OrderCaptureRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalOrdersGateway(storeKey);
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
  request?: RefundRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalCapturesGateway(storeKey);
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

export async function getClientToken(storeKey?: string) {
  const token = await generateAccessToken(storeKey);
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

const multiTenantCredentials = () => {
  const multiTenantIDs =
    process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS &&
    JSON.parse(process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS);
  const multiTenantSecrets =
    process.env.PAYPAL_MULTI_TENANT_CLIENT_SECRETS &&
    JSON.parse(process.env.PAYPAL_MULTI_TENANT_CLIENT_SECRETS);
  if (
    !multiTenantIDs ||
    !multiTenantSecrets ||
    Object.keys(multiTenantIDs).length === 0 ||
    Object.keys(multiTenantSecrets).length === 0 ||
    Object.keys(multiTenantIDs).length !==
      Object.keys(multiTenantSecrets).length
  )
    throw new CustomError(
      500,
      'Internal Server Error - PayPal multi tenant config is invalid'
    );
  else return { multiTenantIDs, multiTenantSecrets };
};

const identifyPayPalCredentials = (storeKey?: string) => {
  if (process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS && storeKey) {
    const { multiTenantIDs, multiTenantSecrets } = multiTenantCredentials();
    if (storeKey) {
      const clientId = multiTenantIDs[storeKey];
      const clientSecret = multiTenantSecrets[storeKey];

      if ((!clientId && clientSecret) || (clientId && !clientSecret)) {
        throw new CustomError(
          500,
          'Internal Server Error - PayPal multi tenant config for the store is invalid'
        );
      }
      if (clientId && clientSecret)
        return { clientId, clientSecret, isMultiTenant: true };
    }
  }
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new CustomError(
      500,
      'Internal Server Error - PayPal config is missing'
    );
  } else {
    return {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      isMultiTenant: false,
    };
  }
};

const createAccessTokenFromCredentials = async (
  clientId: string,
  clientSecret: string,
  endpoint: string
) => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );
  const options = {
    method: 'POST',
    url: `${endpoint}/v1/oauth2/token`,
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
    return response.data;
  } else throw new CustomError(response.status, response.statusText);
};

const generateAccessToken = async (storeKey?: string): Promise<string> => {
  const { clientId, clientSecret, isMultiTenant } =
    identifyPayPalCredentials(storeKey);
  const cachedToken = await getCachedAccessToken(storeKey);

  if (
    cachedToken?.value &&
    cachedToken.value.validUntil > new Date().toISOString()
  ) {
    logger.info('Using cached token');
    return cachedToken.value.accessToken;
  }

  const apiEndpoint = getAPIEndpoint();

  const tokenResponseBody = await createAccessTokenFromCredentials(
    clientId,
    clientSecret,
    apiEndpoint
  );

  await cacheAccessToken(
    {
      accessToken: tokenResponseBody.access_token,
      validUntil: new Date(
        new Date().getTime() + tokenResponseBody.expires_in * 1000
      ),
    },
    cachedToken?.version ?? 0,
    isMultiTenant ? storeKey : undefined
  );
  logger.info(
    `new client token is generated for ${
      storeKey ?? 'default PayPal credentials'
    }`
  );
  return tokenResponseBody.access_token;
};

export const generateUserIdToken = async (
  customerId?: string,
  storeKey?: string
): Promise<string> => {
  if (process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS)
    throw new CustomError(
      '501',
      'Multi tenant vaulting methods are not supported'
    );
  const { clientId, clientSecret } = identifyPayPalCredentials(storeKey);
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );
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

export const createVaultSetupToken = async (
  request: SetupTokenRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalSetupTokenGateway(storeKey);
  const response = await gateway.setupTokensCreate(
    'application/json',
    randomUUID(),
    request
  );
  return response.data;
};

export const createPaymentToken = async (
  request: PaymentTokenRequest,
  storeKey?: string
) => {
  const gateway = await getPayPalPaymentTokenGateway(storeKey);
  const response = await gateway.paymentTokensCreate(
    'application/json',
    randomUUID(),
    request
  );
  return response.data;
};

export const deletePaymentToken = async (
  paymentTokenId: string,
  storeKey?: string
) => {
  const gateway = await getPayPalPaymentTokenGateway(storeKey);
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

export const getPaymentTokens = async (
  customerId: string,
  storeKey?: string
) => {
  const gateway = await getPayPalPaymentTokenGateway(storeKey);
  const response = await gateway.customerPaymentTokensGet(
    'application/json',
    customerId
  );
  return response.data;
};
export const validateSignature = async (
  signature: VerifyWebhookSignature,
  storeKey?: string
) => {
  const gateway = await getPayPalVerifyWebhookSignatureGateway(storeKey);
  const response = await gateway.verifyWebhookSignaturePost(signature);
  return response.data;
};

const getAPIEndpoint = () => {
  return process.env.PAYPAL_ENVIRONMENT === 'Production'
    ? PAYPAL_API_LIVE
    : PAYPAL_API_SANDBOX;
};

export const createWebhook = async (storeKey?: string) => {
  const gateway = await getPayPalWebhooksGateway({ storeKey });
  const response = await gateway.webhooksPost({
    url: getWebhookUrl(),
    event_types: [
      {
        name: '*',
      } as EventType,
    ],
  });
  return response.data;
};

export const deleteWebhook = async (storeKey?: string) => {
  const gateway = await getPayPalWebhooksGateway({ storeKey });
  const webhookId = await getWebhookId({ storeKey });
  if (!webhookId) {
    logger.info(
      `no webhook found for ${storeKey ?? 'default PayPal credentials'}`
    );
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

export const getWebhookId = async (multiTenantConfig?: MultiTenantConfig) => {
  const webhookUrl = getWebhookUrl();
  console.log('webhookUrl', webhookUrl);
  const gateway = await getPayPalWebhooksGateway(multiTenantConfig);
  const webhooks = await gateway.webhooksList('APPLICATION');
  console.log(webhooks.data.webhooks, 'webhooks');
  const webhook = webhooks.data.webhooks?.find(
    (webhook) => webhook.url === webhookUrl
  );
  return webhook?.id;
};

export const getWebhookUrl = () => {
  return (
    process.env.CONNECT_SERVICE_URL?.replace(
      PAYPAL_EXTENSION_PATH,
      PAYPAL_WEBHOOKS_PATH
    ) ?? ''
  );
};

export const addDeliveryData = async (
  orderId: string,
  request: OrderTrackerRequest,
  storeKey?: string
) => {
  const endpoint = await getPayPalOrdersGateway(storeKey);
  const response = await endpoint.ordersTrackCreate(orderId, request);
  return response.data;
};

export const updateDeliveryData = async (
  orderId: string,
  trackerId: string,
  request: Patch[],
  storeKey?: string
) => {
  const endpoint = await getPayPalTrackersGateway(storeKey);
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
