import { LocalizedString } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { UpdateAction } from '@commercetools/sdk-client-v2';
import {
  Bancontact,
  Blik,
  CardResponse,
  CheckoutPaymentIntent,
  Customer,
  Eps,
  Giropay,
  Ideal,
  LinkDescription,
  Mybank,
  Name,
  OrderStatus,
  P24,
  Patch,
  Payer,
  PaymentSource,
  PaypalWalletResponse,
  ProcessingInstruction,
  PurchaseUnit,
  Sofort,
  Trustly,
  VenmoWalletResponse,
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

export type AccessTokenInStoreObject = {
  storeKey: string;
} & AccessTokenObject;

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
  sendTrackingToPayPal: boolean;
  payUponInvoiceMailSubject: LocalizedString;
  payUponInvoiceMailEmailText: LocalizedString;
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

export type SmtpSettings = {
  host: string;
  port: number;
  username: string;
  password: string;
  sender: string;
};

/**
 * The order details.
 * @export
 * @interface Order
 */
export interface Order {
  /**
   * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Seconds are required while fractional seconds are optional.<blockquote><strong>Note:</strong> The regular expression provides guidance but does not reject all invalid dates.</blockquote>
   * @type {string}
   * @memberof Order
   */
  create_time?: string;
  /**
   * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Seconds are required while fractional seconds are optional.<blockquote><strong>Note:</strong> The regular expression provides guidance but does not reject all invalid dates.</blockquote>
   * @type {string}
   * @memberof Order
   */
  update_time?: string;
  /**
   * The ID of the order.
   * @type {string}
   * @memberof Order
   */
  id?: string;
  /**
   *
   * @type {PaymentSourceResponse}
   * @memberof Order
   */
  payment_source?: PaymentSourceResponse;
  /**
   *
   * @type {CheckoutPaymentIntent}
   * @memberof Order
   */
  intent?: CheckoutPaymentIntent;
  /**
   *
   * @type {ProcessingInstruction}
   * @memberof Order
   */
  processing_instruction?: ProcessingInstruction;
  /**
   *
   * @type {Payer}
   * @memberof Order
   */
  payer?: Payer;
  /**
   * An array of purchase units. Each purchase unit establishes a contract between a customer and merchant. Each purchase unit represents either a full or partial order that the customer intends to purchase from the merchant.
   * @type {Array<PurchaseUnit>}
   * @memberof Order
   */
  purchase_units?: Array<PurchaseUnit>;
  /**
   *
   * @type {OrderStatus}
   * @memberof Order
   */
  status?: OrderStatus;
  /**
   * An array of request-related HATEOAS links. To complete payer approval, use the `approve` link to redirect the payer. The API caller has 3 hours (default setting, this which can be changed by your account manager to 24/48/72 hours to accommodate your use case) from the time the order is created, to redirect your payer. Once redirected, the API caller has 3 hours for the payer to approve the order and either authorize or capture the order. If you are not using the PayPal JavaScript SDK to initiate PayPal Checkout (in context) ensure that you include `application_context.return_url` is specified or you will get \"We\'re sorry, Things don\'t appear to be working at the moment\" after the payer approves the payment.
   * @type {Array<LinkDescription>}
   * @memberof Order
   */
  links?: Array<LinkDescription>;
}

/**
 * The payment source used to fund the payment.
 * @export
 * @interface PaymentSourceResponse
 */
export interface PaymentSourceResponse {
  /**
   *
   * @type {CardResponse}
   * @memberof PaymentSourceResponse
   */
  card?: CardResponse;
  /**
   *
   * @type {PaypalWalletResponse}
   * @memberof PaymentSourceResponse
   */
  paypal?: PaypalWalletResponse;
  /**
   *
   * @type {Bancontact}
   * @memberof PaymentSourceResponse
   */
  bancontact?: Bancontact;
  /**
   *
   * @type {Blik}
   * @memberof PaymentSourceResponse
   */
  blik?: Blik;
  /**
   *
   * @type {Eps}
   * @memberof PaymentSourceResponse
   */
  eps?: Eps;
  /**
   *
   * @type {Giropay}
   * @memberof PaymentSourceResponse
   */
  giropay?: Giropay;
  /**
   *
   * @type {Ideal}
   * @memberof PaymentSourceResponse
   */
  ideal?: Ideal;
  /**
   *
   * @type {Mybank}
   * @memberof PaymentSourceResponse
   */
  mybank?: Mybank;
  /**
   *
   * @type {P24}
   * @memberof PaymentSourceResponse
   */
  p24?: P24;
  /**
   *
   * @type {Sofort}
   * @memberof PaymentSourceResponse
   */
  sofort?: Sofort;
  /**
   *
   * @type {Trustly}
   * @memberof PaymentSourceResponse
   */
  trustly?: Trustly;
  /**
   *
   * @type {VenmoWalletResponse}
   * @memberof PaymentSourceResponse
   */
  venmo?: VenmoWalletResponse;
  /**
   *
   * @type {PayUponInvoice}
   * @memberof PaymentSourceResponse
   */
  pay_upon_invoice?: PayUponInvoice;
}

/**
 * Information used to pay using PayUponInvoice.
 * @export
 * @interface PayUponInvoice
 */
export interface PayUponInvoice {
  /**
   * The internationalized email address.<blockquote><strong>Note:</strong> Up to 64 characters are allowed before and 255 characters are allowed after the <code>@</code> sign. However, the generally accepted maximum length for an email address is 254 characters. The pattern verifies that an unquoted <code>@</code> sign exists.</blockquote>
   * @type {string}
   * @memberof PayUponInvoice
   */
  email: string;
  name?: Name;
  deposit_bank_details: {
    iban?: string;
    bic?: string;
    bank_name?: string;
    account_holder_name?: string;
  };
  payment_reference: string;
  experience_context: {
    customer_service_instructions: string[];
  };
}
