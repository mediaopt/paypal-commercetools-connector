import React from "react";
import { render } from "@testing-library/react";

let capturedProps: any;
jest.mock("@paypal/react-paypal-js", () => ({
  PayPalButtons: (props: any) => {
    capturedProps = props;
    return null;
  },
  PayPalMessages: () => null,
}));

const mockHandleUpdateShipping = jest.fn();
const mockResolveShippingOptionId = jest.fn((id: string) => id);

jest.mock("../../app/usePayment", () => ({
  usePayment: () => ({
    handleCreateOrder: jest.fn(),
    handleOnApprove: jest.fn(),
    vaultOnly: false,
    handleCreateVaultSetupToken: jest.fn(),
    handleApproveVaultSetupToken: jest.fn(),
    builderType: "express",
    handleUpdateShipping: mockHandleUpdateShipping,
    resolveShippingOptionId: mockResolveShippingOptionId,
  }),
}));

jest.mock("../../app/useSettings", () => ({
  useSettings: () => ({ settings: undefined, paymentTokens: undefined }),
}));
jest.mock("../../app/useLoader", () => ({
  useLoader: () => ({ isLoading: jest.fn() }),
}));
jest.mock("../../app/useNotifications", () => ({
  useNotifications: () => ({ notify: jest.fn() }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { PayPalMask } from "./PayPalMask";

describe("PayPalMask shipping handlers (PayPal Express)", () => {
  beforeEach(() => {
    capturedProps = undefined;
    mockHandleUpdateShipping.mockReset();
    mockResolveShippingOptionId.mockReset().mockImplementation((id: string) => id);
  });

  it("onShippingAddressChange calls handleUpdateShipping with the buyer's address and does not reject on success", async () => {
    mockHandleUpdateShipping.mockResolvedValue({
      shippingOptions: [],
      amount: { currency_code: "USD", value: "15.00" },
      breakdown: { shipping: { currency_code: "USD", value: "5.00" } },
    });
    render(<PayPalMask />);

    const actions = { reject: jest.fn() };
    await capturedProps.onShippingAddressChange(
      {
        orderID: "order-1",
        shippingAddress: { countryCode: "US", postalCode: "10001" },
      },
      actions
    );

    expect(mockHandleUpdateShipping).toHaveBeenCalledWith({
      orderID: "order-1",
      address: { countryCode: "US", postalCode: "10001" },
    });
    expect(actions.reject).not.toHaveBeenCalled();
  });

  it("onShippingAddressChange rejects the PayPal callback when handleUpdateShipping fails", async () => {
    mockHandleUpdateShipping.mockRejectedValue(new Error("not shippable"));
    render(<PayPalMask />);

    const actions = { reject: jest.fn() };
    await expect(
      capturedProps.onShippingAddressChange(
        { orderID: "order-1", shippingAddress: { countryCode: "XX" } },
        actions
      )
    ).rejects.toThrow();

    expect(actions.reject).toHaveBeenCalled();
  });

  it("onShippingOptionsChange resolves the buyer's selection to its commercetools method id", async () => {
    mockHandleUpdateShipping.mockResolvedValue({
      shippingOptions: [],
      amount: { currency_code: "USD", value: "25.00" },
      breakdown: { shipping: { currency_code: "USD", value: "15.00" } },
    });
    render(<PayPalMask />);

    const actions = { reject: jest.fn() };
    await capturedProps.onShippingOptionsChange(
      { orderID: "order-1", selectedShippingOption: { id: "express" } },
      actions
    );

    expect(mockResolveShippingOptionId).toHaveBeenCalledWith("express");
    expect(mockHandleUpdateShipping).toHaveBeenCalledWith({
      orderID: "order-1",
      shippingMethodId: "express",
    });
    expect(actions.reject).not.toHaveBeenCalled();
  });

  it("onShippingOptionsChange rejects without calling the processor when resolveShippingOptionId rejects the selection", async () => {
    mockResolveShippingOptionId.mockImplementation(() => {
      throw new Error("Selected shipping option unknown-option not found");
    });
    render(<PayPalMask />);

    const actions = { reject: jest.fn() };
    await expect(
      capturedProps.onShippingOptionsChange(
        { orderID: "order-1", selectedShippingOption: { id: "unknown-option" } },
        actions
      )
    ).rejects.toThrow();

    expect(actions.reject).toHaveBeenCalled();
    expect(mockHandleUpdateShipping).not.toHaveBeenCalled();
  });
});
