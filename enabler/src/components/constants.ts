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

export const processorUrls = (processorUrl: string) => ({
  createPaymentUrl: `${processorUrl}/payments`,
  onApproveUrl: `${processorUrl}/payments/approve`,
  createOrderUrl: `${processorUrl}/orders`,
  authorizeOrderUrl: `${processorUrl}/orders/authorize`,
  authenticateThreeDSOrderUrl: `${processorUrl}/orders/3ds/authenticate`,
  getStoredPaymentMethodsURL: `${processorUrl}/stored-payment-methods`,
});
