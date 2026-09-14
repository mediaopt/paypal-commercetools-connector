import * as React from "react";
import { PayUponInvoiceButton } from "./PayUponInvoiceButton";
import { cleanup, render, screen } from "@testing-library/react";
import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";

jest.mock("react-i18next", () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));
jest.mock("../../app/usePayment");
jest.mock("../../app/useSettings");
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

const paymentInfoWithAmount = (centAmount: number) => ({
  id: "123",
  amountPlanned: { centAmount, currencyCode: "EUR" },
});

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
  expect(screen.queryByText("invoice.tooSmall")).toEqual(null);
  expect(screen.queryByText("invoice.tooBig")).toEqual(null);
  expect(screen.queryByText("invoice.thirdPartyIssue")).toEqual(null);
});
