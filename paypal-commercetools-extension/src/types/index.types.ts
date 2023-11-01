import { LocalizedString } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import { Patch } from '../paypal/checkout_api';

export type Message = {
  code: string;
  message: string;
  referencedBy: string;
};

export type ValidatorCreator = (
  path: string[],
  message: Message,
  overrideConfig?: object
) => [string[], [[(o: object) => boolean, string, [object]]]];

export type ValidatorFunction = (o: object) => boolean;

export type Wrapper = (
  validator: ValidatorFunction
) => (value: object) => boolean;

export type UpdateActions = Array<UpdateAction>;

export type StringOrObject = string | object;

export type ClientTokenRequest = {
  customerId?: string;
  merchantAccountId?: string;
  options?: {
    failOnDuplicatePaymentMethod?: boolean;
    makeDefault?: boolean;
    verifyCard?: boolean;
  };
  version?: string;
};

export type UpdatePayPalOrderRequest = {
  orderId: string;
  patch: Array<Patch>;
};

export type AccessTokenObject = {
  accessToken: string;
  validUntil: Date;
};

export type PayPalSettings = {
  acceptPayPal: boolean;
  acceptPayLater: boolean;
  acceptVenmo: boolean;
  acceptLocal: boolean;
  acceptCredit: boolean;
  buttonPaymentPage: boolean;
  buttonCartPage: boolean;
  buttonDetailPage: boolean;
  buttonShippingPage: boolean;
  buttonLayout: string;
  buttonShape: string;
  buttonTagline: boolean;
  buttonColor: string;
  buttonLabel: string;
  payLaterMessagingType: string;
  payLaterMessageCartPage: boolean;
  payLaterMessagePaymentPage: boolean;
  payLaterMessageCategoryPage: boolean;
  payLaterMessageDetailsPage: boolean;
  payLaterMessageHomePage: boolean;
  payLaterMessageTextLogoType: string;
  payLaterMessageTextLogoPosition: string;
  payLaterMessageTextColor: string;
  payLaterMessageTextSize: string;
  payLaterMessageTextAlign: string;
  payLaterMessageFlexColor: string;
  payLaterMessageFlexRatio: string;
  threeDSOption: 'SCA_WHEN_REQUIRED' | 'SCA_ALWAYS';
  payPalIntent: 'Capture' | 'Authorize';
  paymentDescription: LocalizedString;
};
