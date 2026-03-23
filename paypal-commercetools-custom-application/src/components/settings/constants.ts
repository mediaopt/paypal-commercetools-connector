import { SettingsPropComponent } from '../types';
import { DEFAULT_SETTINGS } from './defaultSettings';

export const PAYMENT_DEFAULTS: Record<
  SettingsPropComponent,
  { [key: string]: any }
> = {
  settings: {
    merchantId: DEFAULT_SETTINGS.merchantId,
    acceptPayPal: DEFAULT_SETTINGS.acceptPayPal,
    acceptPayLater: DEFAULT_SETTINGS.acceptPayLater,
    acceptVenmo: DEFAULT_SETTINGS.acceptVenmo,
    acceptLocal: DEFAULT_SETTINGS.acceptLocal,
    acceptCredit: DEFAULT_SETTINGS.acceptCredit,
    payPalIntent: DEFAULT_SETTINGS.payPalIntent,
    paymentDescription: DEFAULT_SETTINGS.paymentDescription,
    storeInVaultOnSuccess: DEFAULT_SETTINGS.storeInVaultOnSuccess,
  },
  payPalCheckoutButtons: {
    buttonPaymentPage: DEFAULT_SETTINGS.buttonPaymentPage,
    buttonCartPage: DEFAULT_SETTINGS.buttonCartPage,
    buttonDetailPage: DEFAULT_SETTINGS.buttonDetailPage,
    buttonShippingPage: DEFAULT_SETTINGS.buttonShippingPage,
    buttonShape: DEFAULT_SETTINGS.buttonShape,
    paypalButtonConfig: DEFAULT_SETTINGS.paypalButtonConfig,
  },
  payPalPayLater: {
    payLaterMessagingType: DEFAULT_SETTINGS.payLaterMessagingType,
    payLaterMessageCartPage: DEFAULT_SETTINGS.payLaterMessageCartPage,
    payLaterMessagePaymentPage: DEFAULT_SETTINGS.payLaterMessagePaymentPage,
    payLaterMessageCategoryPage: DEFAULT_SETTINGS.payLaterMessageCategoryPage,
    payLaterMessageDetailsPage: DEFAULT_SETTINGS.payLaterMessageDetailsPage,
    payLaterMessageHomePage: DEFAULT_SETTINGS.payLaterMessageHomePage,
    payLaterMessageTextLogoType: DEFAULT_SETTINGS.payLaterMessageTextLogoType,
    payLaterMessageTextLogoPosition:
      DEFAULT_SETTINGS.payLaterMessageTextLogoPosition,
    payLaterMessageTextColor: DEFAULT_SETTINGS.payLaterMessageTextColor,
    payLaterMessageTextSize: DEFAULT_SETTINGS.payLaterMessageTextSize,
    payLaterMessageTextAlign: DEFAULT_SETTINGS.payLaterMessageTextAlign,
    payLaterMessageFlexColor: DEFAULT_SETTINGS.payLaterMessageFlexColor,
    payLaterMessageFlexRatio: DEFAULT_SETTINGS.payLaterMessageFlexRatio,
  },
  threeDS: {
    threeDSOption: DEFAULT_SETTINGS.threeDSOption,
    threeDSAction: DEFAULT_SETTINGS.threeDSAction,
  },
  ratePay: {
    ratePayBrandName: DEFAULT_SETTINGS.ratePayBrandName,
    ratePayLogoUrl: DEFAULT_SETTINGS.ratePayLogoUrl,
    ratePayCustomerServiceInstructions:
      DEFAULT_SETTINGS.ratePayCustomerServiceInstructions,
    payUponInvoiceMailSubject: DEFAULT_SETTINGS.payUponInvoiceMailSubject,
    payUponInvoiceMailEmailText: DEFAULT_SETTINGS.payUponInvoiceMailEmailText,
  },
  tracking: {
    sendTrackingToPayPal: DEFAULT_SETTINGS.sendTrackingToPayPal,
  },
  ccFields: {
    hostedFieldsPayButtonClasses: DEFAULT_SETTINGS.hostedFieldsPayButtonClasses,
    hostedFieldsInputFieldClasses:
      DEFAULT_SETTINGS.hostedFieldsInputFieldClasses,
  },
};
