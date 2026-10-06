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

  it("renders once the Payment exists", () => {
    const { queryByTestId } = renderButton({
      paymentInfo: { id: "payment-1" },
    });

    expect(queryByTestId("paypal-mask")).not.toBeNull();
  });

  it("renders for vaultOnly without a Payment", () => {
    //legacy mode only
    const { queryByTestId } = renderButton({ vaultOnly: true });

    expect(queryByTestId("paypal-mask")).not.toBeNull();
  });

  it("renders for PayPal Express without a Payment — handleCreateOrder creates it on click", () => {
    const { queryByTestId } = renderButton({ createsPaymentOnClick: true });

    expect(queryByTestId("paypal-mask")).not.toBeNull();
  });
});
