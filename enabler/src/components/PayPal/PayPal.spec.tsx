import { render } from "@testing-library/react";

// Real RenderTemplate → PayPal → PayPalContextProvider chain; only the leaves are stubbed
const mockPaymentProvider = jest.fn();
jest.mock("../../app/usePayment", () => ({
  PaymentProvider: (props: Record<string, unknown>) => {
    mockPaymentProvider(props);
    return <>{props.children}</>;
  },
}));
jest.mock("../../app/useSettings", () => ({
  SettingsProvider: (props: { children: unknown }) => <>{props.children}</>,
}));
jest.mock("../RenderPurchase/RenderPurchase", () => ({
  RenderPurchase: (props: { children: unknown }) => <>{props.children}</>,
}));
const mockPayPalButton = jest.fn();
jest.mock("./PayPalButton", () => ({
  PayPalButton: (props: Record<string, unknown>) => {
    mockPayPalButton(props);
    return null;
  },
}));
jest.mock("../RenderTemplate/resolveOptions", () => ({
  resolvePayPalBrandOptions: jest.fn(() => ({
    options: { clientId: "resolved" },
    initialSettings: {},
    enableVaulting: false,
  })),
}));

import { RenderTemplate } from "../RenderTemplate/RenderTemplate";

describe("PayPal onError wiring", () => {
  it("forwards Checkout's onError from RenderTemplate through PayPal to PaymentProvider, not to the button", () => {
    const onError = jest.fn();

    render(
      <RenderTemplate
        paymentMethodType="PayPal"
        builderType="express"
        baseOptions={{ processorUrl: "https://processor.example" } as any}
        genericOptions={{ requestHeader: {}, onError } as any}
      />
    );

    expect(mockPaymentProvider.mock.calls[0][0]).toHaveProperty(
      "onError",
      onError
    );
    expect(mockPayPalButton.mock.calls[0][0]).not.toHaveProperty("onError");
  });
});
