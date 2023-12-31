import { SettingsFormDataType } from '../../types/types';

export const DEFAULT_SETTINGS: SettingsFormDataType = {
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
  payUponInvoiceMailSubject: { de: 'Pay Upon Invoice' },
  payUponInvoiceMailEmailText: {
    de:
      'Bitte überweisen Sie den Betrag von ##price## an folgendes Konto!\n' +
      'Verwendungszweck: ##payment_reference##\n' +
      'BIC: ##bic##\n' +
      'Bank Name: ##bank_name##\n' +
      'IBAN: ##iban##\n' +
      'Kontoinhaber: ##account_holder_name##\n' +
      'Instructions: ##customer_service_instructions##',
  },
};
