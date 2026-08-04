export const processorUrls = (processorUrl: string) => ({
  createPaymentUrl: `${processorUrl}/payments`,
  getSettingsUrl: `${processorUrl}/settings`,
  onApproveUrl: `${processorUrl}/payments/approve`,
  createOrderUrl: `${processorUrl}/orders`,
  authorizeOrderUrl: `${processorUrl}/orders/authorize`,
  authenticateThreeDSOrderUrl: `${processorUrl}/orders/3ds/authenticate`,
  createVaultSetupTokenUrl: `${processorUrl}/vault/setup-tokens`,
  approveVaultSetupTokenUrl: `${processorUrl}/vault/setup-tokens/approve`,
  getStoredPaymentMethodsURL: `${processorUrl}/stored-payment-methods`,
});
