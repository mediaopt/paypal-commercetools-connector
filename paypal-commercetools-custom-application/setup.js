jest.mock('./src/constants', () => {
  return {
    entryPointUriPath: 'paypal-payment-panel',
    PERMISSIONS: { View: 'ViewTest', Manage: 'ManageTest' },
  };
});
