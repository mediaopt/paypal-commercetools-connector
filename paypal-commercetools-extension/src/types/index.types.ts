import { LocalizedString } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import {
  Customer,
  LinkDescription,
  Patch,
  PaymentSource,
} from '../paypal/checkout_api';

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
  partnerAttributionId: string;
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

export type PayPalVaultPaymentTokenResource = {
  id: string;
  metadata: {
    order_id: string;
  };
  time_created: string;
  links?: Array<LinkDescription>;
  payment_source?: PaymentSource;
  customer?: Customer;
};
