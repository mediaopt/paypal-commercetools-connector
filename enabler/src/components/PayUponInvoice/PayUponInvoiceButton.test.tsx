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
jest.mock("../../app/useHandleCreatePayment");
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

const testButtonProps = {
  minPayableAmount: 5,
  maxPayableAmount: 2500,
  fraudNetSessionId: "123",
};

test("Mask is shown if settings and params are valid", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: { id: "123", amount: 20 },
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
    paymentInfo: { id: "123", amount: 20 },
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
    paymentInfo: { id: "123", amount: 1 },
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
    paymentInfo: { id: "123", amount: 100500 },
    clientToken: "123",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.tooBig").length).toEqual(1);
});

test("If client tocken is missing corresponding error is shown", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: { id: "123", amount: 20 },
    clientToken: "",
  });
  (useSettings as jest.Mock).mockReturnValue({
    settings: { payPalIntent: "Capture" },
  });
  render(<PayUponInvoiceButton {...testButtonProps} />);
  expect(screen.getAllByText("invoice.thirdPartyIssue").length).toEqual(1);
});

test("If payment id is missing mask and error messages are not rendered", () => {
  (usePayment as jest.Mock).mockReturnValue({
    paymentInfo: { id: "", amount: 20 },
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
