import { ChangeEvent } from 'react';
import { LocalizedString } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';

export type SettingsFormDataType = {
  acceptPayPal: boolean;
  acceptPayLater: boolean;
  acceptVenmo: boolean;
  acceptLocal: boolean;
  acceptCredit: boolean;
  buttonPaymentPage: boolean;
  buttonCartPage: boolean;
  buttonDetailPage: boolean;
  buttonShippingPage: boolean;
  buttonShape: 'rect' | 'pill';
  buttonTagline: boolean;
  payLaterMessagingType: 'flex' | 'text';
  payLaterMessageHomePage: boolean;
  payLaterMessageCategoryPage: boolean;
  payLaterMessageDetailsPage: boolean;
  payLaterMessageCartPage: boolean;
  payLaterMessagePaymentPage: boolean;
  payLaterMessageTextLogoType: 'inline' | 'primary' | 'alternative' | 'none';
  payLaterMessageTextLogoPosition: 'left' | 'right' | 'top';
  payLaterMessageTextColor: 'black' | 'white' | 'monochrome' | 'grayscale';
  payLaterMessageTextSize: '10' | '11' | '12' | '13' | '14' | '15' | '16';
  payLaterMessageTextAlign: 'left' | 'center' | 'right';
  payLaterMessageFlexColor:
    | 'blue'
    | 'black'
    | 'white'
    | 'white-no-border'
    | 'gray'
    | 'monochrome'
    | 'grayscale';
  payLaterMessageFlexRatio: '1x1' | '1x4' | '8x1' | '20x1';
  threeDSOption: '' | 'SCA_ALWAYS' | 'SCA_WHEN_REQUIRED';
  payPalIntent: 'Authorize' | 'Capture';
  ratePayBrandName: LocalizedString;
  ratePayLogoUrl: LocalizedString;
  ratePayCustomerServiceInstructions: LocalizedString;
  paymentDescription: LocalizedString;
  storeInVaultOnSuccess: boolean;
  paypalButtonConfig: {
    buttonColor: PayPalButtonColors;
    buttonLabel: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment';
  };
  hostedFieldsPayButtonClasses: string;
  hostedFieldsInputFieldClasses: string;
  threeDSAction: Record<string, unknown>;
  merchantId?: string;
};

type PayPalButtonColors = 'gold' | 'blue' | 'white' | 'silver' | 'black';

export type PayPalSettingsType = {
  values: SettingsFormDataType;
  handleChange: {
    (e: ChangeEvent<any>): void;
    <T = string | ChangeEvent<any>>(field: T): T extends ChangeEvent<any>
      ? void
      : (e: string | ChangeEvent<any>) => void;
  };
};

export type FetchedCustomObjectType = {
  value: SettingsFormDataType;
  version: number;
};

export type ApollonFetchedCustomObjectType = {
  data: {
    createOrUpdateCustomObject: FetchedCustomObjectType;
  };
};
