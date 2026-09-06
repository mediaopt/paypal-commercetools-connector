import { render, screen } from "@testing-library/react";

jest.mock("../PayPal", () => ({
  PayPal: (props: Record<string, unknown>) => (
    <div data-testid="probe" data-props={JSON.stringify(props)} />
  ),
}));

jest.mock("../CardFields", () => ({
  CardFields: (props: Record<string, unknown>) => (
    <div data-testid="cardfields-probe" data-props={JSON.stringify(props)} />
  ),
}));

// Decouples dispatch-correctness (this file) from resolution-correctness (resolveOptions.spec.ts).
jest.mock("./resolveOptions", () => ({
  resolvePayPalBrandOptions: jest.fn(() => ({
    options: { clientId: "resolved" },
    initialSettings: {},
    enableVaulting: false,
  })),
  resolveCardFieldsOptions: jest.fn(() => ({
    options: { clientId: "resolved-cardfields" },
    initialSettings: {},
    enableVaulting: true,
  })),
}));

import { RenderTemplate } from "./RenderTemplate";
import {
  resolveCardFieldsOptions,
  resolvePayPalBrandOptions,
} from "./resolveOptions";

const baseOptions = {
  processorUrl: "https://processor.example",
  sdkOptions: {},
  settings: {},
} as any;
const genericOptions = { requestHeader: { "X-Session-Id": "session-id" } } as any;

describe("RenderTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches PayPal-brand types to resolvePayPalBrandOptions and merges genericOptions + resolved options onto <PayPal/>", () => {
    render(
      <RenderTemplate
        paymentMethodType="Sepa"
        builderType="express"
        baseOptions={baseOptions}
        genericOptions={genericOptions}
      />
    );

    expect(resolvePayPalBrandOptions).toHaveBeenCalledWith(
      "Sepa",
      baseOptions,
      "express"
    );
    expect(resolveCardFieldsOptions).not.toHaveBeenCalled();

    const probe = screen.getByTestId("probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props).toMatchObject({
      requestHeader: { "X-Session-Id": "session-id" },
      options: { clientId: "resolved" },
      enableVaulting: false,
      paymentMethodType: "Sepa",
      builderType: "express",
      processorUrl: "https://processor.example",
    });
  });

  it("dispatches CardFields to resolveCardFieldsOptions and renders <CardFields/>", () => {
    render(
      <RenderTemplate
        paymentMethodType="CardFields"
        baseOptions={baseOptions}
        genericOptions={genericOptions}
      />
    );

    expect(resolveCardFieldsOptions).toHaveBeenCalledWith(
      baseOptions,
      "CardFields"
    );
    expect(resolvePayPalBrandOptions).not.toHaveBeenCalled();

    const probe = screen.getByTestId("cardfields-probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props).toMatchObject({
      options: { clientId: "resolved-cardfields" },
      enableVaulting: true,
      paymentMethodType: "CardFields",
    });
  });

  it("throws for an unsupported payment method type", () => {
    expect(() =>
      render(
        <RenderTemplate
          paymentMethodType={"Invalid Method" as any}
          baseOptions={baseOptions}
          genericOptions={genericOptions}
        />
      )
    ).toThrow("Unsupported payment method type: Invalid Method");
  });
});
