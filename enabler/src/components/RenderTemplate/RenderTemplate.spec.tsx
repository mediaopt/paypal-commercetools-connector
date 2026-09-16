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

import { RenderTemplate } from "./RenderTemplate";

describe("RenderTemplate", () => {
  it("forwards paymentMethodType and builderType to the rendered component, alongside customOptions", () => {
    render(
      <RenderTemplate
        paymentMethodType="PayPal"
        builderType="express"
        customOptions={{ foo: "bar" }}
      />
    );

    const probe = screen.getByTestId("probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props).toMatchObject({
      foo: "bar",
      paymentMethodType: "PayPal",
      builderType: "express",
    });
  });

  it("dispatches to CardFields for paymentMethodType=CardFields", () => {
    render(
      <RenderTemplate
        paymentMethodType="CardFields"
        customOptions={{ foo: "bar" }}
      />
    );

    const probe = screen.getByTestId("cardfields-probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props).toMatchObject({
      foo: "bar",
      paymentMethodType: "CardFields",
    });
  });

  it("injects processorUrls()-derived URLs (createPaymentUrl, createOrderUrl, etc.) when processorUrl is passed", () => {
    render(
      <RenderTemplate
        paymentMethodType="PayPal"
        customOptions={{}}
        processorUrl="https://processor.test"
      />
    );

    const probe = screen.getByTestId("probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props).toMatchObject({
      createPaymentUrl: "https://processor.test/payments",
      createOrderUrl: "https://processor.test/payments/createOrder",
      authorizeOrderUrl: "https://processor.test/payments/authorize",
      onApproveUrl: "https://processor.test/payments/approve",
      authenticateThreeDSOrderUrl: "https://processor.test/payments/3ds",
    });
  });

  it("injects nothing beyond customOptions when processorUrl is absent (self-hosted mode)", () => {
    render(<RenderTemplate paymentMethodType="PayPal" customOptions={{}} />);

    const probe = screen.getByTestId("probe");
    const props = JSON.parse(probe.getAttribute("data-props") ?? "{}");

    expect(props.createPaymentUrl).toBeUndefined();
    expect(props.createOrderUrl).toBeUndefined();
  });

  it("throws for an unsupported payment method type", () => {
    expect(() =>
      render(
        <RenderTemplate paymentMethodType="Invalid Method" customOptions={{}} />
      )
    ).toThrow("Unsupported payment method type: Invalid Method");
  });
});
