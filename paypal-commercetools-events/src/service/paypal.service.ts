import axios from 'axios';
import qs from 'qs';
import { OrdersApi, OrderTrackerRequest } from '../paypal/checkout_api';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { Configuration } from '../paypal/configuration';
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

const getAPIEndpoint = () => {
  return process.env.PAYPAL_ENVIRONMENT === 'Production'
    ? PAYPAL_API_LIVE
    : PAYPAL_API_SANDBOX;
};

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

const getPayPalOrdersGateway = async (timeout: number = TIMEOUT_PAYMENT) => {
  return new OrdersApi(await buildConfiguration(timeout));
};

export const addDeliveryData = async (
  orderId: string,
  request: OrderTrackerRequest
) => {
  const endpoint = await getPayPalOrdersGateway(2000);
  const response = await endpoint.ordersTrackCreate(
    orderId,
    'application/json',
    request
  );
  return response.data;
};
