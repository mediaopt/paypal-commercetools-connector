export const PAYPAL_PAYMENT_EXTENSION_KEY = 'paypal-payment-extension';
export const PAYPAL_CUSTOMER_EXTENSION_KEY = 'paypal-customer-extension';

export const PAYPAL_PAYMENT_TYPE_KEY = 'paypal-payment-type';
export const PAYPAL_CUSTOMER_TYPE_KEY = 'paypal-customer-type';
export const PAYPAL_PAYMENT_INTERACTION_TYPE_KEY =
  'paypal-payment-interaction-type';

export const GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME =
  'paypal-commercetools-connector';

export const GRAPHQL_CUSTOMOBJECT_KEY_NAME = 'settings';

export const CUSTOM_OBJECT_DEFAULT_VALUES = {
  merchantId: '',
  acceptPayPal: true,
  acceptPayLater: true,
  acceptVenmo: true,
  acceptLocal: true,
  acceptCredit: false,
  buttonPaymentPage: true,
  buttonCartPage: true,
  buttonDetailPage: true,
  buttonShippingPage: true,
  buttonShape: 'rect',
  payLaterMessagingType: {
    home: 'flex',
    category: 'flex',
    product: 'text',
    cart: 'text',
    payment: 'text',
  },
  payLaterMessageCartPage: true,
  payLaterMessagePaymentPage: true,
  payLaterMessageCategoryPage: true,
  payLaterMessageDetailsPage: true,
  payLaterMessageHomePage: true,
  payLaterMessageTextLogoType: 'primary',
  payLaterMessageTextLogoPosition: 'left',
  payLaterMessageTextColor: 'black',
  payLaterMessageTextSize: '12',
  payLaterMessageTextAlign: 'left',
  payLaterMessageFlexColor: 'blue',
  payLaterMessageFlexRatio: '1x1',
  threeDSOption: 'SCA_WHEN_REQUIRED',
  payPalIntent: 'Capture',
  ratePayBrandName: { de: '' },
  ratePayLogoUrl: { de: '' },
  ratePayCustomerServiceInstructions: { de: '' },
  paymentDescription: { en: '' },
  storeInVaultOnSuccess: false,
  paypalButtonConfig: { buttonColor: 'gold', buttonLabel: 'buynow' },
  hostedFieldsPayButtonClasses: '',
  hostedFieldsInputFieldClasses: '',
  threeDSAction: {
    threeDSAction_1: '2',
    threeDSAction_2: '2',
    threeDSAction_3: '0',
    threeDSAction_4: '0',
    threeDSAction_5: '2',
    threeDSAction_6: '1',
    threeDSAction_7: '1',
    threeDSAction_8: '1',
    threeDSAction_9: '1',
    threeDSAction_10: '2',
    threeDSAction_11: '2',
    threeDSAction_12: '1',
    threeDSAction_13: '2',
    threeDSAction_14: '1',
  },
  sendTrackingToPayPal: false,
};
