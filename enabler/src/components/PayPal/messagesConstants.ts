// Countries PayPal Pay Later messaging (<PayPalMessages/>) actually supports — see
// https://www.paypal.com/us/enterprise/pay-later — used to gate the standard PayPal button's
// auto-resolved messages (PayPalMask.tsx's resolvedPaypalMessages) so we never ask the SDK to
// render messaging for a buyer country it doesn't cover.
export const PAY_LATER_MESSAGES_SUPPORTED_COUNTRIES = new Set([
  "US", // United States
  "AU", // Australia
  "CA", // Canada
  "FR", // France
  "DE", // Germany
  "IT", // Italy
  "ES", // Spain
  "GB", // United Kingdom
]);
