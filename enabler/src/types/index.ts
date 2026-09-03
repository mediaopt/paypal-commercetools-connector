import { Dispatch, SetStateAction } from "react";
import {
  PayPalButtonsComponentProps,
  ReactPayPalScriptOptions,
  PayPalMessagesComponentProps,
} from "@paypal/react-paypal-js";
import type { FUNDING_SOURCE } from "@paypal/paypal-js/types/components/funding-eligibility";
import { CTAmount } from "../payment-enabler/interfaces/general";

export type ValidationHandlers = {
  isValid: () => Promise<boolean>;
  showValidation: () => Promise<void>;
};

export type FormComponentProps = {
  /**
   * Lets a mounted component register its own submit handler, which `PaymentComponent.submit()`
   * then delegates to.
   */
  onRegisterSubmit?: (
    handler: (storePaymentDetails?: boolean) => Promise<void>
  ) => void;

  /**
   * Lets a mounted component register its own validation handlers, which
   * `PaymentComponent.showValidation()`/`isValid()` then delegate to.
   */
  onRegisterValidation?: (handlers: ValidationHandlers) => void;
};

export type GenericError = {
  code: string;
  message: string;
};

export type BuilderType = "dropin" | "express" | undefined;

export type PayPalPaymentMethodType =
  | "PayPal"
  | "CardFields"
  | "CardFieldsStored"
  | "ApplePay"
  | "GooglePay"
  | "PayUponInvoice"
  | "Venmo"
  | "Sepa"
  | "PayLater"
  | "PayPalCreditCard"
  | "AllButtons";
// Not "PaymentTokens" — stored/vaulted payment methods have their own separate interface
// (StoredComponentBuilder / createStoredPaymentMethodBuilder), not this one.

export type PayPalPaymentMethodExpressType = Extract<
  PayPalPaymentMethodType,
  "PayPal"
>;

export type CreateVaultSetupTokenRequest = { paymentSource: FUNDING_SOURCE };
export type CreateVaultSetupTokenResponse = {
  createVaultSetupTokenResponse: { id: string };
  version: string;
};

export type ApproveVaultSetupTokenRequest = { vaultSetupToken: string };
export type ApproveVaultSetupTokenResponse = {
  createPaymentTokenResponse: { id: string };
  version: string;
};

export type ApproveVaultSetupTokenData = { vaultSetupToken: string };

/**
 * @deprecated Legacy/self-hosted-only — not used by commercetools Checkout. This processor never
 * invents/echoes a commercetools version for an entity the fast checkout APIs already manage, so
 * this stays undefined against it (see enabler/src/app/usePayment.tsx); only relevant for a
 * self-hosted backend that still expects a client-tracked version. See the processor
 * implementation (processor/src/dtos/paypal-payment.dto.ts) for how version/concurrency is
 * actually handled instead.
 */
export type PaymentVersion = number;

export type CreateOrderRequest = {
  paymentId: string;
  paymentVersion?: PaymentVersion;
  orderData?: CreatePayPalOrderData;
  /** The merchant's configured PayPal intent (from settings), so the processor can create the
   * PayPal order with a matching intent — PayPal rejects an authorize call against an order
   * created with intent=CAPTURE, and vice versa for capture. */
  payPalIntent?: "Authorize" | "Capture";
  /** Lets buildOrderRequest tell the PayPal Express flow apart, so it never sets
   * experience_context.shipping_preference: "SET_PROVIDED_ADDRESS" for it — that value tells
   * PayPal the shipping address is fixed and disables the buyer's ability to change it in the
   * popup, which would make onShippingAddressChange/onShippingOptionsChange unreachable. */
  builderType?: BuilderType;
  /** The same paymentMethodType already sent on the initial /payments request (see
   * PaymentRequestSchemaDTO's paymentMethodType) — lets the processor apply payment-method-specific
   * order constraints, e.g. Venmo's USD-only requirement. */
  paymentMethodType?: PayPalPaymentMethodType;
};

export type CreateOrderData = {
  paymentSource?: FUNDING_SOURCE | "google_pay" | "apple_pay";
  storeInVault?: boolean;
  vaultId?: string;
  verificationMethod?: ThreeDSVerification;
};

export type CreateInvoiceData = {
  fraudNetSessionId?: string;
  birthDate?: string;
  nationalNumber?: string;
  countryCode?: string;
};

export type CreatePayPalOrderData = CreateOrderData & CreateInvoiceData;

export type OrderData = {
  id: string;
  status: string;
  success?: boolean;
  message?: string;
  details?: string;
  payment_source?: {
    card: {
      name: string;
      last_digits: string;
      expiry: string;
      brand: string;
      available_networks: string[];
      type: string;
    };
  };
  links?: OrderDataLinks;
};

export type CreateOrderResponse = {
  orderData: OrderData;
  paymentVersion?: PaymentVersion;
  ok?: boolean;
};

export type OnApproveRequest = {
  paymentId: string;
  paymentVersion?: PaymentVersion;
  orderID: string;
  saveCard?: boolean;
  builderType?: BuilderType;
};

export type OnApproveResponse = {
  orderData: { id: string; status: string; message?: string };
  paymentVersion?: PaymentVersion;
  /** Buyer redirect target built by the processor (see PAYPAL_ONAPPROVE_PREFIX/MERCHANT_RETURN_URL) — when
   * present, the enabler navigates there instead of showing the normal result UI. */
  merchantReturnUrl?: string;
};

// PayPal Express only (both Authorize and Capture intent), gated by PAYPAL_REDIRECT_ON_APPROVE —
// see usePayment.tsx's handleOnApprove and the processor's expressApprove().
export type ExpressApproveRequest = {
  paymentId: string;
  orderID: string;
  payPalIntent?: "Authorize" | "Capture";
};

export type ExpressApproveResponse = {
  onApproveRedirectionUrl?: string;
};

// paymentId is deliberately not part of this type — usePayment.tsx's handleUpdateShipping
// resolves it internally from paymentInfo.id
export type UpdateShippingRequest = {
  orderID: string;
  shippingMethodId?: string;
  address?: {
    countryCode: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
  //prevents refetching options if only method was changed for same address
  shippingOptions?: PayPalShippingOption[];
};

export type PayPalMoney = {
  currency_code: string;
  value: string;
};

export type UpdateShippingResponse = {
  shippingOptions: PayPalShippingOption[];
  amount: PayPalMoney;
  breakdown: {
    item_total?: PayPalMoney;
    shipping: PayPalMoney;
    tax_total?: PayPalMoney;
    discount?: PayPalMoney;
  };
};

export type LoadingOverlayType = {
  loadingText?: string;
  textStyles?: string;
};

export type RequestHeader = { [key: string]: string };

/** Category 1 — basic data every payment component needs. */
export type BasicComponentProps = {
  options: ReactPayPalScriptOptions;
  requestHeader: RequestHeader;
  enableVaulting?: boolean;
};

/** Category 2 — per-endpoint URLs. In Checkout mode, RenderTemplate injects all of these (via
 * processorUrls()) into the same named props a self-hosted merchant would otherwise fill in
 * directly — the two deployment modes converge on identical prop names, just from different
 * sources. `createPaymentUrl` is the one field the standalone client always required; the other 4
 * were always optional there too, and usePayment.tsx restores that same required/optional split
 * and its original silent-no-op-when-missing behavior (no `@deprecated` marking needed — nothing
 * here is being phased out, it's just populated one way or the other). */
export type LegacyEndpointUrlProps = {
  createPaymentUrl: string;
  onApproveUrl?: string;
  authorizeOrderUrl?: string;
  /** @deprecated superseded by `processorUrl` + `processorUrls()`. */
  removePaymentTokenUrl?: string;
  createOrderUrl?: string;
  authenticateThreeDSOrderUrl?: string;
};

/** Category 3 — Checkout-only fields, no standalone-client equivalent. */
export type CheckoutOnlyProps = {
  paymentMethodType?: PayPalPaymentMethodType;
  builderType?: BuilderType;
  processorUrl?: string;
  /** Seeds SettingsProvider's `settings` state from the processor's `/operations/config` response. */
  initialSettings?: GetSettingsResponse;
  /** Seeds SettingsProvider's `userIdToken` state from the processor's `/operations/config` response. */
  initialUserIdToken?: string;
  /** PayPal Express only, from the processor's `/operations/config` `redirectOnApprove` (its
   * PAYPAL_REDIRECT_ON_APPROVE) — see `usePayment.tsx`'s `handleOnApprove`. */
  redirectOnApprove?: boolean;
};

/** Category 4 — legacy fields with no `processorUrl` migration path.
 * will be kept for backward compatibility, but it is strongly suggested to
 * use commercetools checkout for access to fast APIs or at least update the self-hosted bff
 * to processor-like structure for support*/
export type LegacyReplaceableProps = {
  purchaseCallback?: (result: any, options?: any) => void; //see `MERCHANT_RETURN_URL` instead
  // deprecated, see processor module for recommended bff handling
  shippingMethodId?: string;
  getSettingsUrl?: string; // see processor config instead
  getOrderUrl?: string; //included directly where relevant in processor calls
  onApproveRedirectionUrl?: string; //see processor `PAYPAL_ONAPPROVE_PREFIX` (or the generic `MERCHANT_RETURN_URL`)
} & CartInformationProps; //see enabler PaymentData instead

/*will be kept at least until commercetools checkout natively supports vaulting for all methods
for vaulting except credit card inside commercetools checkout please open an issue,
for stored credit card see processor stored payment methods
* */
export type LegacyVaultProps = {
  getUserInfoUrl?: string;
  createVaultSetupTokenUrl?: string;
  approveVaultSetupTokenUrl?: string;
  getClientTokenUrl?: string;
};

export type LegacyOnlyProps = LegacyReplaceableProps & LegacyVaultProps;

export type GeneralComponentsProps = BasicComponentProps &
  LegacyEndpointUrlProps &
  CheckoutOnlyProps &
  LegacyOnlyProps;

export type ThreeDSVerification = "SCA_ALWAYS" | "SCA_WHEN_REQUIRED";

export type HostedFieldsThreeDSAuth = {
  threeDSAuth?: ThreeDSVerification;
};

export type HostedFieldsProps = Pick<
  BasicComponentProps,
  "options" | "enableVaulting"
>;

export type CardFieldsProps = Pick<BasicComponentProps, "enableVaulting"> &
  FormComponentProps;

export type HostedFieldsSmartComponentProps = SmartComponentsProps &
  HostedFieldsThreeDSAuth;

export type FraudnetPage =
  | "home-page"
  | "search-result-page"
  | "category-page"
  | "product-detail-page"
  | "cart-page"
  | "inline-cart-page"
  | "checkout-page";

type ratepayPaymentRestrictions = {
  minPayableAmount: number;
  maxPayableAmount: number;
};

export type PayUponInvoiceProps = ratepayPaymentRestrictions & {
  merchantId: string;
  pageId: FraudnetPage;
  invoiceBenefitsMessage?: string;
  customLocale?: string;
};

export type PayUponInvoiceMaskProps = {
  fraudNetSessionId: string;
} & Pick<PayUponInvoiceProps, "invoiceBenefitsMessage">;

export type PayUponInvoiceButtonProps = ratepayPaymentRestrictions &
  PayUponInvoiceMaskProps;

export type CustomPayPalButtonsComponentProps = Omit<
  PayPalButtonsComponentProps,
  | "createOrder"
  | "createBillingAgreement"
  | "createSubscription"
  | "onApprove"
  | "onCancel"
  | "onClick"
  | "onError"
  | "onInit"
  | "fundingSource"
> & {
  paypalMessages?: PayPalMessagesComponentProps;
  // Always an array — one <PayPalButtons/> renders per entry, see PayPalBuilder.ts's 4-layer
  // resolution of settings.PayPal/PayPalExpress and PayPalMask.tsx's rendering of it.
  fundingSource?: FUNDING_SOURCE;
} & Pick<BasicComponentProps, "enableVaulting">;

export type SmartComponentsProps = CustomPayPalButtonsComponentProps &
  GeneralComponentsProps;

export type ApplePayProps = {
  applePayDisplayName: string;
};

export type ApplePayComponentsProps = ApplePayProps & SmartComponentsProps;

export type CartInformation = {
  account: {
    email: string;
  };
  billing: {
    firstName: string;
    lastName: string;
    streetName: string;
    streetNumber: string;
    city: string;
    country: string;
    postalCode: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    streetName: string;
    streetNumber: string;
    city: string;
    country: string;
    postalCode: string;
  };
};

export const CartInformationInitial: CartInformation = {
  account: {
    email: "",
  },
  billing: {
    firstName: "",
    lastName: "",
    streetName: "",
    streetNumber: "",
    city: "",
    country: "",
    postalCode: "",
  },
  shipping: {
    firstName: "",
    lastName: "",
    streetName: "",
    streetNumber: "",
    city: "",
    country: "",
    postalCode: "",
  },
};

export type CartInformationProps = { cartInformation?: CartInformation };

/**
 * Source of truth for every field shared between `PaymentInfo` (enabler state) and
 * `CreatePaymentResponse` (the processor's wire response) — defined once here so the two
 * don't drift apart.
 */
/**
 * PayPal shipping option as returned by the processor during onShippingChange flow.
 */
export type PayPalShippingOption = {
  id: string;
  label: string;
  type: "SHIPPING";
  amount: PayPalMoney;
  selected: boolean;
};

/**
 * Shipping address type matching mapCommercetoolsAddressToPayPalAddress's return shape.
 */
export type ShippingAddress = {
  type: string;
  name: {
    full_name: string;
  };
  address: {
    address_line_1: string;
    admin_area_2?: string;
    postal_code?: string;
    country_code: string;
  };
};

export type PaymentData = {
  /** For this connector: the commercetools Payment id, from createPayment()'s response. */
  id: string;
  amountPlanned: {
    centAmount: number;
    currencyCode: string;
    fractionDigits: number;
  };
  lineItems?: unknown[];
  email?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  shippingAddress?: ShippingAddress;
  shippingOptions?: PayPalShippingOption[];
  priceBreakdown?: unknown;
  ctCustomerId?: string;
  /** Not used by the checkout. Please open an
   * issue if you are interested in vault-based customer-version tracking. */
  customerVersion?: number;
  /** @deprecated Not used by the checkout; only relevant for a self-hosted backend that still
   * expects a client-tracked version. See the processor implementation
   * (processor/src/dtos/paypal-payment.dto.ts) for how version/concurrency is actually handled
   * instead. */
  version?: number;
};

export type PaymentInfo = PaymentData & CartInformationProps;

export type CreatePaymentResponse = PaymentData & {
  paypalData: { clientId: string; currency: string };
  /** @deprecated Not used by the checkout; only relevant for a self-hosted backend built against
   * the old `paypal-commercetools-client` npm package's contract. See the processor implementation
   * (processor/src/dtos/paypal-payment.dto.ts) for the current, checkout-native contract. */
  braintreeCustomerId?: string;
};

export type ClientTokenResponse = {
  clientToken: string;
  paymentVersion: number;
  error?: string;
};

export type CardPaymentSource = {
  name: string;
  last_digits: string;
  brand: string;
  expiry: string;
  verification_status: string;
  verification: {
    network_transaction_id: string;
    time: string;
    amount: {
      currency_code: string;
      value: string;
    };
    processor_response: {
      avs_code: string;
      cvv_code: string;
      response_code: string;
    };
  };
};
export type PayPalPaymentSource = {
  shipping: {
    name: {
      full_name: string;
    };
    address: {
      address_line_1: string;
      address_line_2: string;
      admin_area_2: string;
      admin_area_1: string;
      postal_code: string;
      country_code: string;
    };
  };
  usage_type: string;
  customer_type: string;
  email_address: string;
  payer_id: string;
  name: {
    given_name: string;
    surname: string;
    full_name: string;
  };
  phone: {
    phone_number: {
      country_code: string;
      national_number: string;
    };
  };
  tenant: string;
};

export type PaymentTokens = {
  customer?: { id: string };
  payment_tokens?: Array<{
    id: string;
    customer: { id: string };
    payment_source: {
      card: CardPaymentSource;
      paypal: PayPalPaymentSource;
      venmo: PayPalPaymentSource;
      apple_pay: {
        card: CardPaymentSource;
      };
    };
  }>;
};

export type GetUserInfoResponse = {
  userIdToken?: string;
  paymentTokens?: PaymentTokens;
};

export type ClientTokenRequest = {
  paymentId: string;
  paymentVersion?: number;
  braintreeCustomerId?: string;
  merchantAccountId?: string;
};

type CustomDataStringObject = { [key: string]: string };
type PayPalButtonColors = "gold" | "blue" | "white" | "silver" | "black";
type PayPalButtonConfig = {
  buttonColor: PayPalButtonColors;
  buttonLabel: "paypal" | "checkout" | "buynow" | "pay" | "installment";
};

// One PayPal payment method's fully-resolved style (or PayPalExpress's) — mirrors the PayPal JS
// SDK's own `style` prop shape (color/label/shape together), so it can be applied to
// <PayPalButtons/> as one unit.
type PayPalMethodStyle = PayPalButtonConfig & { buttonShape: "rect" | "pill" };

// A payment method's processor-configured override (PAYPAL_BUTTON_CONFIG in
// processor/.env.template), keyed by paymentMethodType, with a dedicated PayPalExpress slot for
// builderType: "express" — see RenderTemplate/resolveOptions.ts's 4-layer resolution. Every field
// is wholesale-replace when present, not merged field-by-field with whatever a lower-priority
// layer already resolved. Not every payment method uses every field — e.g. CardFields has no
// button style/funding sources, only `components`.
export type PayPalMethodConfig = {
  style?: PayPalMethodStyle;
  fundingSource?: FUNDING_SOURCE;
  // PayPal JS SDK script `components` list for this payment method (e.g. "buttons,card-fields") —
  // same concern as PAYPAL_SDK_OPTIONS.<paymentMethodType>.components, but resolved through this
  // 4-layer chain instead; PAYPAL_SDK_OPTIONS still wins if it also sets `components` (see
  // RenderTemplate/resolveOptions.ts).
  components?: string;
  // ApplePay only — the merchant-facing store name shown in Apple's native payment sheet.
  applePayDisplayName?: string;
};

/** Method-independent props every mounted component receives — assembled once by
 * PayPalComponent.mount() from BaseOptions/ComponentOptions, with zero per-payment-method
 * branching. Handed to RenderTemplate as-is and merged with whichever resolved options
 * RenderTemplate/resolveOptions.ts produces for the given paymentMethodType. */
export type GenericMountProps = FormComponentProps & {
  requestHeader: RequestHeader;
  // deprecated, see processor module for recommended bff handling
  shippingMethodId?: string;
  purchaseCallback?: (result: any, options?: any) => void;
  redirectOnApprove?: boolean;
  initialUserIdToken?: string;
  showPayButton?: boolean;
  fullWidth?: boolean;
  buttonText?: string;
  onError?: (error: GenericError) => void;
  initialAmount?: CTAmount;
  /** only for a stored-payment-method component (PayPalStoredBuilder) — PayPal's
   * vault payment-token id of the saved card */
  ppVaultTokenId?: string;
};

export type BaseResolvedMethodOptions = {
  options: ReactPayPalScriptOptions;
  // BaseOptions.settings is guaranteed present by the time mount() runs (see its own comment) —
  // spreading it here can safely be typed as the full GetSettingsResponse, not a Partial.
  initialSettings: GetSettingsResponse;
  enableVaulting: boolean;
};

/** Resolved options for the shared <PayPal/> smart-button component (PayPal, Sepa, PayLater,
 * PayPalCreditCard, AllButtons, Venmo). */
export type PayPalBrandResolvedOptions = BaseResolvedMethodOptions & {
  fundingSource?: FUNDING_SOURCE;
};

/** Resolved options for <CardFields/> and <CardFieldsStored/>  — no style/fundingSource concept at all,
 * unlikePayPalBrandResolvedOptions
 */
export type CardFieldsResolvedOptions = BaseResolvedMethodOptions;

/** Resolved options for <ApplePay/> — no style/fundingSource concept either, plus the one field
 * unique to it: the merchant store name shown in the native Apple Pay sheet. */
export type ApplePayResolvedOptions = BaseResolvedMethodOptions & {
  applePayDisplayName: string;
};

/** The 6 paymentMethodType values that render through the shared <PayPal/> component. */
export type PayPalBrandButtonType = Extract<
  PayPalPaymentMethodType,
  "PayPal" | "Sepa" | "PayLater" | "PayPalCreditCard" | "AllButtons" | "Venmo"
>;

// Legacy — mirrors common-connect's PayPalSettings (the CT paypal-commercetools-connector/settings
// custom object shape, read via getSettings()). Duplicated here rather than imported since the
// enabler doesn't depend on common-connect — keep field names in sync with that type by hand.
type PayPalLegacySettings = {
  merchantId: string;
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
  buttonShape: "rect" | "pill";
  buttonTagline: boolean;
  payLaterMessagingType: Record<string, "flex" | "text">;
  payLaterMessageHomePage: boolean;
  payLaterMessageCategoryPage: boolean;
  payLaterMessageDetailsPage: boolean;
  payLaterMessageCartPage: boolean;
  payLaterMessagePaymentPage: boolean;
  payLaterMessageTextLogoType: "inline" | "primary" | "alternative" | "none";
  payLaterMessageTextLogoPosition: "left" | "right" | "top";
  payLaterMessageTextColor: "black" | "white" | "monochrome" | "grayscale";
  payLaterMessageTextSize: "10" | "11" | "12" | "13" | "14" | "15" | "16";
  payLaterMessageTextAlign: "left" | "center" | "right";
  payLaterMessageFlexColor:
    | "blue"
    | "black"
    | "white"
    | "white-no-border"
    | "gray"
    | "monochrome"
    | "grayscale";
  payLaterMessageFlexRatio: "1x1" | "1x4" | "8x1" | "20x1";
  threeDSOption: "" | "SCA_ALWAYS" | "SCA_WHEN_REQUIRED";
  payPalIntent: "Authorize" | "Capture";
  ratePayBrandName: CustomDataStringObject;
  ratePayLogoUrl: CustomDataStringObject;
  ratePayCustomerServiceInstructions: CustomDataStringObject;
  paymentDescription: CustomDataStringObject;
  storeInVaultOnSuccess: boolean;
  paypalButtonConfig: PayPalButtonConfig;
  hostedFieldsPayButtonClasses: string;
  hostedFieldsInputFieldClasses: string;
  threeDSAction: Record<string, any>;
};

// New — processor-only per-payment-method overrides (PAYPAL_BUTTON_CONFIG in
// processor/.env.template), not part of the CT custom object/PayPalLegacySettings above.
// Has higher priority for relevant payment method. Keyed by paymentMethodType directly (e.g.
// "PayPal", "CardFields", "Venmo") — "PayPalExpress" is the one dedicated addition, since only
// PayPal's own component with builderType: "express" needs a config slot separate from its own
// paymentMethodType entry (see RenderTemplate/resolveOptions.ts's express-first resolution). A
// closed union of literal keys, not a generic `string` index signature — the latter would force
// every other GetSettingsResponse field (e.g. storeInVaultOnSuccess: boolean) to also satisfy
// PayPalMethodConfig wherever an object literal is checked against GetSettingsResponse.
type PayPalComponentOverrides = Partial<
  Record<PayPalPaymentMethodType | "PayPalExpress", PayPalMethodConfig>
>;

export type GetSettingsResponse = PayPalLegacySettings &
  PayPalComponentOverrides;

export type CustomOnApproveData = {
  orderID: string;
  billingToken?: string | null;
  facilitatorAccessToken?: string;
  payerID?: string | null;
  paymentID?: string | null;
  subscriptionID?: string | null;
  authCode?: string | null;
  saveCard?: boolean;
  liabilityShift?: string;
};

export type SetStringState = Dispatch<SetStateAction<string | undefined>>;

type GooglePayDataType = {
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
  }[];
  paymentData: { [key: string]: any };
};

export type CustomOrderData = CreatePayPalOrderData & {
  setRatepayMessage?: SetStringState;
  googlePayData?: GooglePayDataType;
};

export type SettingsProviderProps = Pick<
  GeneralComponentsProps,
  | "requestHeader"
  | "options"
  | "getSettingsUrl"
  | "getUserInfoUrl"
  | "removePaymentTokenUrl"
  | "processorUrl"
  | "initialSettings"
  | "initialUserIdToken"
>;

export type RemovePaymentTokenRequest = { paymentTokenId: string };

type OrderDataLink = {
  href: string;
  rel: string;
  method: string;
};

export type OrderDataLinks = OrderDataLink[];

export type GooglePayOptionsType = {
  environment?: "TEST" | "PRODUCTION";
  allowedCardNetworks: string[];
  allowedCardAuthMethods: string[];
  callbackIntents: string[];
  apiVersion?: number;
  apiVersionMinor?: number;
  totalPriceStatus?: "FINAL" | "ESTIMATED";
  buttonColor?: "default" | "white" | "black";
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe";
  buttonRadius?: number;
  buttonSizeMode?: "static" | "fill";
  verificationMethod: ThreeDSVerification;
};

export type ApplePaySession = any;

export type ApplepayConfig = {
  countryCode: string;
  currencyCode: string;
  isEligible: boolean;
  merchantCapabilities: string[];
  merchantCountry: string;
  supportedNetworks: string[];
};

type ApplepayValidateMerchant = {
  validationUrl: string;
  displayName: string;
};

type ApplepayConfirmOrder = {
  orderId: string;
  token: string;
  billingContact: string;
};

type ApplepayValidateMerchantResult = {
  merchantSession: string;
};

export type Applepay = {
  config: () => Promise<ApplepayConfig>;
  confirmOrder: ({}: ApplepayConfirmOrder) => Promise<void>;
  validateMerchant: ({}: ApplepayValidateMerchant) => Promise<ApplepayValidateMerchantResult>;
};
