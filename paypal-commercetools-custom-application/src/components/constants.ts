import { SettingsPropComponent } from './types';

export const PAYMENT_TITLES = {
  settings: 'PayPal general settings',
  payPalCheckoutButtons: 'Checkout buttons settings',
  payPalPayLater: 'PayLater settings',
  threeDS: '3D Secure settings',
  ratePay: 'RatePay settings',
  tracking: 'Parcel tracking settings',
  ccFields: 'Credit card field settings',
};

export const PAYPAL_MENU_LINKS = Object.keys(
  PAYMENT_TITLES
) as SettingsPropComponent[];
