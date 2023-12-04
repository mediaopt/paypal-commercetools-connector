import {
  Delivery,
  LocalizedString,
  OrderReference,
  Parcel,
} from '@commercetools/platform-sdk';

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

export type ParcelAddedToDeliveryMessagePayload = {
  notificationType: 'Message';
  projectKey: string;
  id: string;
  version: number;
  sequenceNumber: number;
  resource: OrderReference;
  resourceVersion: number;
  type: 'ParcelAddedToDelivery';
  delivery: Delivery;
  parcel: Parcel;
  createdAt: string;
  lastModifiedAt: string;
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
  ratePayCustomerServiceInstructions: LocalizedString;
  ratePayBrandName: LocalizedString;
  ratePayLogoUrl: LocalizedString;
  paymentDescription: LocalizedString;
  storeInVaultOnSuccess: boolean;
  sendTrackingToPayPal: boolean;
};
