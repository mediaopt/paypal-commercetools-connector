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

  it("throws for an unsupported payment method type", () => {
    expect(() =>
      render(
        <RenderTemplate
          paymentMethodType={"Invalid Method" as any}
          customOptions={{}}
        />
      )
    ).toThrow("Unsupported payment method type: Invalid Method");
  });
});
