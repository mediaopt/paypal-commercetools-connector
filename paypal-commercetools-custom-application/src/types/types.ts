import { ChangeEvent } from 'react';

type CustomDataStringObject = { [key: string]: string };

export type SettingsFormDataType = {
  email: string;
  acceptPayPal: boolean;
  acceptPayLater: boolean;
  acceptVenmo: boolean;
  acceptLocal: boolean;
  acceptCredit: boolean;
  buttonPaymentPage: boolean;
  buttonCartPage: boolean;
  buttonDetailPage: boolean;
  buttonShippingPage: boolean;
  buttonShape: 'rectangle' | 'pill';
  buttonTagline: boolean;
  buttonColor: 'blue' | 'gold' | 'gray' | 'white' | 'black';
  buttonLabel: 'pay';
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
  partnerAttributionId: string;
  ratePayBrandName: CustomDataStringObject;
  ratePayLogoUrl: CustomDataStringObject;
  ratePayCustomerServiceInstructions: CustomDataStringObject;
  paymentDescription: CustomDataStringObject;
};

export type PayPalSettingsType = {
  values: SettingsFormDataType;
  handleChange: {
    (e: ChangeEvent): void;
    <T = string | ChangeEvent>(field: T): T extends ChangeEvent
      ? void
      : (e: string | ChangeEvent) => void;
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
