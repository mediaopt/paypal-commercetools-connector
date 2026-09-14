import * as React from "react";

import { render } from "@testing-library/react";
import { PayUponInvoiceProps } from "../../types";

import { PayUponInvoice } from "./index";
import { ReactNode } from "react";
import {
  testOptions,
  testParams,
  testPaypalInvoiceParams,
  testRequestHeader,
} from "../../constants";

const fraudNetUrl = "https://c.paypal.com/da/r/fb.js";

const PayUponInvoiceJson = {
  options: {
    ...testOptions,
  },
  requestHeader: { ...testRequestHeader },
  ...testParams,
  ...testPaypalInvoiceParams,
};

const mockChange = jest.fn();
jest.mock("react-i18next", () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: mockChange(),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

jest.mock("../RenderTemplate", () => ({
  RenderTemplate: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

test("Fraud net script is loaded on PUI render", () => {
  render(<PayUponInvoice {...PayUponInvoiceJson} />);
  const fraudnetScript = document.querySelectorAll(
    `script[src="${fraudNetUrl}"]`,
  );
  expect(fraudnetScript.length).toEqual(1);
});

const customPaypalInvoiceParams: PayUponInvoiceProps = {
  merchantId: "",
  pageId: "checkout-page",
  minPayableAmount: 5, //euro
  maxPayableAmount: 2500, //euro
  customLocale: "ua",
};

test("If custom locale is set, locale change is called", async () => {
  render(
    <PayUponInvoice {...PayUponInvoiceJson} {...customPaypalInvoiceParams} />,
  );
  expect(mockChange).toHaveBeenCalled();
});
