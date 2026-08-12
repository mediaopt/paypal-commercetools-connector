export const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || 'payment-integration',
  clientId: process.env.CTP_CLIENT_ID || 'xxx',
  clientSecret: process.env.CTP_CLIENT_SECRET || 'xxx',
  jwksUrl: process.env.CTP_JWKS_URL || 'https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json',
  jwtIssuer: process.env.CTP_JWT_ISSUER || 'https://mc-api.europe-west1.gcp.commercetools.com',
  authUrl: process.env.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
  apiUrl: process.env.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
  sessionUrl: process.env.CTP_SESSION_URL || 'https://session.europe-west1.gcp.commercetools.com/',
  checkoutUrl: process.env.CTP_CHECKOUT_URL || 'https://checkout.europe-west1.gcp.commercetools.com',

  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),

  // Required by logger
  loggerLevel: process.env.LOGGER_LEVEL || 'info',

  // Required for PayPal
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || 'Sandbox',

  // Payment Providers config
  returnUrl: process.env.MERCHANT_RETURN_URL || '',
  paymentInterface: 'PayPal',

  // env variables related to stored payment methods feature
  storedPaymentMethodsEnabled: process.env.STORED_PAYMENT_METHODS_ENABLED || 'false',
  storedPaymentMethodsPaymentInterface: process.env.STORED_PAYMENT_METHODS_PAYMENT_INTERFACE || 'psp-template',
  storedPaymentMethodsInterfaceAccount: process.env.STORED_PAYMENT_METHODS_INTERFACE_ACCOUNT || undefined,

  // General feature flags
  enableVaulting: process.env.STORED_PAYMENT_METHODS_ENABLED === 'true',

  // Per-method required config (non-style, method-specific identifiers)
  // Format: JSON object, e.g. {"creditCard":{"someConfig":"..."}}
  perMethodConfig: process.env.PAYPAL_PER_METHOD_CONFIG
    ? JSON.parse(process.env.PAYPAL_PER_METHOD_CONFIG)
    : undefined,
};

export const getConfig = () => {
  return config;
};
