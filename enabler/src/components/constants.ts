/*
the following URLS are irrelevant for checkout flow as these data
are handled by the processor and returned from config
getSettingsUrl,
createVaultSetupTokenUrl
approveVaultSetupTokenUrl

if you deploy the components yourself
it is your responsibility to submit the URLS directly
 */

export const processorUrls = (processorUrl: string) => ({
  createPaymentUrl: `${processorUrl}/payments`,
  onApproveUrl: `${processorUrl}/payments/approve`,
  createOrderUrl: `${processorUrl}/orders`,
  authorizeOrderUrl: `${processorUrl}/orders/authorize`,
  authenticateThreeDSOrderUrl: `${processorUrl}/orders/3ds/authenticate`,
  getStoredPaymentMethodsURL: `${processorUrl}/stored-payment-methods`,
});
