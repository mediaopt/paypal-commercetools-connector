import { render } from "@testing-library/react";

const mockUsePayment = jest.fn();
jest.mock("../../app/usePayment", () => ({
  usePayment: () => mockUsePayment(),
}));
jest.mock("./PayPalMask", () => ({
  PayPalMask: () => <div data-testid="paypal-mask" />,
}));

import { PayPalButton } from "./PayPalButton";

const renderButton = (context: Record<string, unknown>) => {
  mockUsePayment.mockReturnValue({
    paymentInfo: { id: "" },
    vaultOnly: false,
    createsPaymentOnClick: false,
    ...context,
  });
  return render(<PayPalButton />);
};

describe("PayPalButton render gate", () => {
  it("renders nothing for a standard button until its Payment exists", () => {
    const { queryByTestId } = renderButton({});

    expect(queryByTestId("paypal-mask")).toBeNull();
  });

  it.each<[string, Record<string, unknown>]>([
    ["once the Payment exists", { paymentInfo: { id: "payment-1" } }],
    ["for vaultOnly (legacy mode only) without a Payment", { vaultOnly: true }],
    [
      "for PayPal Express without a Payment — handleCreateOrder creates it on click",
      { createsPaymentOnClick: true },
    ],
  ])("renders %s", (_, context) => {
    const { queryByTestId } = renderButton(context);

    expect(queryByTestId("paypal-mask")).not.toBeNull();
  });
});
