/*
IMPORTANT — if you deploy these payment components yourself, outside commercetools Checkout
(i.e. without going through the processor/enabler wiring below), it is entirely your
responsibility to provide every URL these components use, AND to implement the actual logic
behind each one (request/response shape, auth, error handling — not just the endpoint address).
None of that is supplied for you in this scenario.

The following URLs are additionally irrelevant for the commercetools Checkout flow specifically,
since that data is instead handled by the processor and/or have limited support in the checkout:
getSettingsUrl, createVaultSetupTokenUrl, approveVaultSetupTokenUrl
 */

const stripTrailingSlash = (processorUrl: string) => processorUrl.replace(/\/$/, "");

export const processorUrls = (processorUrl: string) => {
  const base = stripTrailingSlash(processorUrl);
  return {
    createPaymentUrl: `${base}/payments`,
    onApproveUrl: `${base}/payments/approve`,
    createOrderUrl: `${base}/payments/createOrder`,
    authorizeOrderUrl: `${base}/payments/authorize`,
    authenticateThreeDSOrderUrl: `${base}/payments/3ds`,
    updateShippingUrl: `${base}/payments/updateShipping`,
    getStoredPaymentMethodsURL: `${base}/stored-payment-methods`,
  };
};

// The one route needing a path param — processorUrls()'s flat string map can't express that.
export const storedPaymentMethodUrl = (processorUrl: string, id: string) =>
  `${stripTrailingSlash(processorUrl)}/stored-payment-methods/${id}`;
