import { PayPalMessagesComponentProps } from "@paypal/react-paypal-js";
import { PayUponInvoiceProps } from "../types";

export const PARTNER_ATTRIBUTION_ID: string = "commercetoolsGmbH_SP_PPCP";

export const testCartInformation = {
  account: {
    email: "payment_source_info_cannot_be_verified@example.com",
  },
  billing: {
    firstName: "John",
    lastName: "Smith",
    streetName: "Hochstraße",
    streetNumber: "37",
    city: "Berlin",
    country: "DE",
    postalCode: "12045",
  },
  shipping: {
    firstName: "John",
    lastName: "Smith",
    streetName: "Hochstraße",
    streetNumber: "37",
    city: "Berlin",
    country: "DE",
    postalCode: "12045",
  },
};

export const testRequestHeader = {
  "Frontastic-Session": "test",
  "Commercetools-Frontend-Extension-Version": "test",
};

export const ENDPOINT_URL: string =
  "https://poc-mediaopt2.frontastic.rocks/frontastic/action";

export const testCommonParams = {
  getSettingsUrl: `${ENDPOINT_URL}/settings/getPayPalSettings`,
  getClientTokenUrl: `${ENDPOINT_URL}/payment/getClientToken`,
  createPaymentUrl: `${ENDPOINT_URL}/payment/createPayment`,
  purchaseCallback: (result: any, options: any) => {
    console.log("Do something", result, options);
  },
};

export const testParams = {
  ...testCommonParams,
  createOrderUrl: `${ENDPOINT_URL}/payment/createPayPalOrder`,
  authorizeOrderUrl: `${ENDPOINT_URL}/payment/authorizePayPalOrder`,
  onApproveUrl: `${ENDPOINT_URL}/payment/capturePayPalOrder`,
  shippingMethodId: "da416140-39bf-4677-8882-8b6cab23d981",
  cartInformation: testCartInformation,
};

export const testVaultParams = {
  getUserInfoUrl: `${ENDPOINT_URL}/payment/getUserInfo`,
  enableVaulting: true,
};

export const testVaultOnlyParams = {
  ...testCommonParams,
  getUserInfoUrl: `${ENDPOINT_URL}/payment/getUserInfo`,
  enableVaulting: true,
  createVaultSetupTokenUrl: `${ENDPOINT_URL}/payment/createVaultSetupToken`,
  approveVaultSetupTokenUrl: `${ENDPOINT_URL}/payment/approveVaultSetupToken`,
  shippingMethodId: "da416140-39bf-4677-8882-8b6cab23d981",
};

export const testOptions = {
  clientId: "test",
  currency: "EUR",
};

export const testPayPalMessagesParams: PayPalMessagesComponentProps = {
  amount: "100.00",
  currency: "EUR",
  style: {
    layout: "text",
  },
  placement: "product",
};

export const testPaypalInvoiceParams: PayUponInvoiceProps = {
  merchantId: "W3KJAHBNV5BS6",
  pageId: "checkout-page",
  minPayableAmount: 5, //euro
  maxPayableAmount: 2500, //euro
  customLocale: "de",
};
