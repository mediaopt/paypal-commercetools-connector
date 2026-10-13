import * as React from "react";
import { PayUponInvoiceButton } from "./PayUponInvoiceButton";
import { cleanup, render, screen } from "@testing-library/react";
import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";
import { CartInformationInitial } from "../../types";

// Field labels come from the real translations (in mockLanguage), so a code without a label
// shows up as its raw code or another language's label; every other key stays as is.
let mockLanguage = "en";
jest.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  useTranslation: () => {
    return {
      t: (str: string, options?: { fields?: string; defaultValue?: string }) =>
        str.startsWith("invoice.fields.")
          ? jest
              .requireActual<{ default: { t: (...args: unknown[]) => string } }>(
                "../../messages/i18n"
              )
              .default.t(str, { ...options, lng: mockLanguage })
          : options?.fields
          ? `${str}: ${options.fields}`
          : str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));
jest.mock("../../app/usePayment");
jest.mock("../../app/useSettings");
const mockNotify = jest.fn();
jest.mock("../../app/useNotifications", () => ({
  useNotifications: () => ({ notify: mockNotify }),
}));
jest.mock("./PayUponInvoiceMask", () => ({
  PayUponInvoiceMask: (
    fraudNetSessionId: string,
    invoiceBenefitsMessage: string | undefined,
  ) => <div>Mocked mask</div>,
}));

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  cleanup();
});

// minPayableAmount/maxPayableAmount are in cents, matching PayUponInvoiceButton's own comparison
// against paymentInfo.amountPlanned.centAmount (5-2500 EUR, same range hardcoded in
// enabler/src/components/constants.ts).
const testButtonProps = {
  minPayableAmount: 500,
  maxPayableAmount: 250000,
  fraudNetSessionId: "123",
};

const paymentInfoWithAmount = (
  centAmount: number,
  overrides: Record<string, unknown> = {}
) => ({
  id: "123",
  amountPlanned: { centAmount, currencyCode: "EUR" },
  countryCode: "DE",
  firstName: "Max",
  lastName: "Mustermann",
  email: "max@example.com",
  ...overrides,
});

const mockCaptureState = (
  overrides: Record<string, unknown>,
  clientToken = "123"
) => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000, overrides),
    clientToken,
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
};

const missingBuyerDataMessage = (...labels: string[]) =>
  `invoice.missingBuyerData: ${labels.join(", ")}`;

test("Mask is shown if settings and params are valid (legacy mode)", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("Mocked mask").length).toEqual(1);
});

test("If intent is wrong corresponding error is shown", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.merchantIssue").length).toEqual(1);
});

test("In Checkout mode (onRegisterSubmit provided), a non-Capture settings.payPalIntent does not block the mask — regression test for the two-script-tag crash", () => {
  // Intent is forced to Capture at createOrder submission time in Checkout mode (see
  // usePayment.tsx's handleCreateOrder), not via settings, so this check must not fire there.
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Authorize" },
  });
  render(
    <PayUponInvoiceButton {...testButtonProps} onRegisterSubmit={() => {}} />,
  );
  expect(screen.getAllByText("Mocked mask").length).toEqual(1);
  expect(screen.queryByText("invoice.merchantIssue")).toEqual(null);
});

test("If amount is smaller than min corresponding error is shown", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(100),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.tooSmall").length).toEqual(1);
});

test("If amount is bigger than max corresponding error is shown", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(300000),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.tooBig").length).toEqual(1);
});

test("If billing country is not DE corresponding error is shown", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000, { countryCode: "AT" }),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.wrongCountry").length).toEqual(1);
});

test("If currency is not EUR corresponding error is shown instead of the euro amount error", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(300000, {
      amountPlanned: { centAmount: 300000, currencyCode: "USD" },
    }),
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.wrongCurrency").length).toEqual(1);
  expect(screen.queryByText("invoice.tooBig")).toEqual(null);
});

test("The processor's missing-fields list is shown as translated labels instead of the mask", () => {
  mockCaptureState({
    payUponInvoiceMissingFields: [
      "billingAddress.streetName",
      "billingAddress.city",
    ],
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(
    screen.getAllByText(
      missingBuyerDataMessage("street", "city")
    ).length
  ).toEqual(1);
  expect(screen.queryByText("Mocked mask")).toEqual(null);
});

// Every code the processor's findPayUponInvoiceMissingFields (order.utils.ts) can send.
const FIELD_LABELS = {
  "billingAddress.firstName": { en: "first name", de: "Vorname" },
  "billingAddress.lastName": { en: "last name", de: "Nachname" },
  "billingAddress.streetName": { en: "street", de: "Straße" },
  "billingAddress.postalCode": { en: "postal code", de: "Postleitzahl" },
  "billingAddress.city": { en: "city", de: "Ort" },
  "billingAddress.country": { en: "country", de: "Land" },
  email: { en: "e-mail address", de: "E-Mail-Adresse" },
};

describe.each(["en", "de"] as const)("Field labels (%s)", (language) => {
  beforeEach(() => {
    mockLanguage = language;
  });
  afterEach(() => {
    mockLanguage = "en";
  });

  test.each(Object.entries(FIELD_LABELS))(
    "A missing %s from the processor is shown as its label",
    (field, labels) => {
      mockCaptureState({ payUponInvoiceMissingFields: [field] });
      render(<PayUponInvoiceButton {...testButtonProps} />);
      expect(
        screen.getAllByText(missingBuyerDataMessage(labels[language])).length
      ).toEqual(1);
    }
  );
});

test("An empty missing-fields list from the processor wins over the legacy name/e-mail check", () => {
  mockCaptureState({ email: undefined, payUponInvoiceMissingFields: [] });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("Mocked mask").length).toEqual(1);
});

test.each([
  ["firstName", "first name"],
  ["lastName", "last name"],
  ["email", "e-mail address"],
])(
  "Legacy backend without a missing-fields list: a missing %s is named on its own",
  (field, label) => {
    mockCaptureState({ [field]: undefined });
    render(<PayUponInvoiceButton {...testButtonProps} />);
    expect(
      screen.getAllByText(missingBuyerDataMessage(label)).length
    ).toEqual(1);
  }
);

// An old backend returns none of the buyer fields; the merchant's cartInformation prop has them.
const legacyCartInformation = (billing: Record<string, string>) => ({
  account: { email: "max@example.com" },
  billing: {
    ...CartInformationInitial.billing,
    firstName: "Max",
    lastName: "Mustermann",
    country: "DE",
    ...billing,
  },
  shipping: CartInformationInitial.shipping,
});
const legacyBackendOverrides = {
  countryCode: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
};

test("Legacy backend without buyer data: country, name and e-mail are read from cartInformation", () => {
  mockCaptureState({
    ...legacyBackendOverrides,
    cartInformation: legacyCartInformation({}),
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("Mocked mask").length).toEqual(1);
});

test("Legacy backend without buyer data: a non-DE cartInformation country shows the wrong-country error", () => {
  mockCaptureState({
    ...legacyBackendOverrides,
    cartInformation: legacyCartInformation({ country: "AT" }),
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.wrongCountry").length).toEqual(1);
});

test("Legacy backend without buyer data: a name missing in cartInformation too is named", () => {
  mockCaptureState({
    ...legacyBackendOverrides,
    cartInformation: legacyCartInformation({ lastName: "" }),
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(
    screen.getAllByText(missingBuyerDataMessage("last name")).length
  ).toEqual(1);
});

test("In Checkout mode, missing fields make isValid() false, showValidation() notify and submit() reject with the same message", async () => {
  mockCaptureState(
    { payUponInvoiceMissingFields: ["billingAddress.postalCode"] },
    ""
  );
  const onRegisterSubmit = jest.fn();
  const onRegisterValidation = jest.fn();
  render(
    <PayUponInvoiceButton
      {...testButtonProps}
      onRegisterSubmit={onRegisterSubmit}
      onRegisterValidation={onRegisterValidation}
    />,
  );

  const [submit] = onRegisterSubmit.mock.calls.at(-1) as [
    () => Promise<void>,
  ];
  const [validation] = onRegisterValidation.mock.calls.at(-1) as [
    { isValid: () => Promise<boolean>; showValidation: () => Promise<void> },
  ];
  await expect(validation.isValid()).resolves.toBe(false);
  expect(mockNotify).not.toHaveBeenCalled();
  await validation.showValidation();
  expect(mockNotify).toHaveBeenCalledWith(
    "Warning",
    missingBuyerDataMessage("postal code")
  );
  await expect(submit()).rejects.toThrow(
    missingBuyerDataMessage("postal code")
  );
  expect(screen.queryByText("Mocked mask")).toEqual(null);
});

test("In legacy mode (no onRegisterSubmit), missing clientToken shows the third-party error", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000),
    clientToken: "",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.thirdPartyIssue").length).toEqual(1);
});

test("In Checkout mode (onRegisterSubmit provided), a missing clientToken does not block the mask", () => {
  // clientToken is a Braintree-era concept never populated in Checkout mode — see
  // PayUponInvoiceButton.tsx's own comment — so it must not gate rendering when onRegisterSubmit
  // is set.
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: paymentInfoWithAmount(2000),
    clientToken: "",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(
    <PayUponInvoiceButton {...testButtonProps} onRegisterSubmit={() => {}} />,
  );
  expect(screen.getAllByText("Mocked mask").length).toEqual(1);
  expect(screen.queryByText("invoice.thirdPartyIssue")).toEqual(null);
});

test("If payment id is missing mask and error messages are not rendered", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: { id: "", amountPlanned: { centAmount: 2000 } },
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.queryByText("Mocked mask")).toEqual(null);
  expect(screen.queryByText("invoice.merchantIssue")).toEqual(null);
  expect(screen.queryByText("invoice.wrongCountry")).toEqual(null);
  expect(screen.queryByText("invoice.wrongCurrency")).toEqual(null);
  expect(screen.queryByText(/invoice\.missingBuyerData/)).toEqual(null);
  expect(screen.queryByText("invoice.tooSmall")).toEqual(null);
  expect(screen.queryByText("invoice.tooBig")).toEqual(null);
  expect(screen.queryByText("invoice.thirdPartyIssue")).toEqual(null);
});
