import { render } from "@testing-library/react";

let capturedProps: any;
let capturedCalls: any[];
jest.mock("@paypal/react-paypal-js", () => ({
  PayPalButtons: (props: any) => {
    capturedProps = props;
    capturedCalls.push(props);
    return null;
  },
  PayPalMessages: () => null,
}));

const mockHandleUpdateShipping = jest.fn();
const mockResolveShippingOptionId = jest.fn((id: string) => id);

const mockUsePayment = jest.fn();
jest.mock("../../app/usePayment", () => ({
  usePayment: () => mockUsePayment(),
}));

const basePaymentMock = {
  handleCreateOrder: jest.fn(),
  handleOnApprove: jest.fn(),
  vaultOnly: false,
  handleCreateVaultSetupToken: jest.fn(),
  handleApproveVaultSetupToken: jest.fn(),
  handleUpdateShipping: mockHandleUpdateShipping,
  resolveShippingOptionId: mockResolveShippingOptionId,
};

const mockUseSettings = jest.fn();
jest.mock("../../app/useSettings", () => ({
  useSettings: () => mockUseSettings(),
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
    capturedCalls = [];
    mockHandleUpdateShipping.mockReset();
    mockResolveShippingOptionId
      .mockReset()
      .mockImplementation((id: string) => id);
    mockUsePayment.mockReset().mockReturnValue({
      ...basePaymentMock,
      builderType: "express",
    });
    mockUseSettings.mockReset().mockReturnValue({
      settings: undefined,
      paymentTokens: undefined,
    });
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
        {
          orderID: "order-1",
          selectedShippingOption: { id: "unknown-option" },
        },
        actions
      )
    ).rejects.toThrow();

    expect(actions.reject).toHaveBeenCalled();
    expect(mockHandleUpdateShipping).not.toHaveBeenCalled();
  });
});

describe("PayPalMask button style (paypalButtonConfig) — standard builder", () => {
  beforeEach(() => {
    capturedProps = undefined;
    capturedCalls = [];
    mockHandleUpdateShipping.mockReset();
    mockResolveShippingOptionId
      .mockReset()
      .mockImplementation((id: string) => id);
    mockUsePayment.mockReset().mockReturnValue({
      ...basePaymentMock,
      builderType: "standard",
    });
    mockUseSettings.mockReset().mockReturnValue({
      settings: {
        paypalButtonConfig: { buttonColor: "blue", buttonLabel: "buynow" },
      },
      paymentTokens: undefined,
    });
  });

  it("applies color and label when no fundingSource prop is passed (auto-render defaults to PayPal's own branding)", () => {
    render(<PayPalMask />);

    expect(capturedCalls).toHaveLength(1);
    expect(capturedProps.style.label).toBe("buynow");
    expect(capturedProps.style.color).toBe("blue");
  });

  it("applies buttonColor when fundingSource is 'paypal' (as PayPalBuilder passes by default)", () => {
    render(<PayPalMask fundingSource="paypal" />);

    expect(capturedProps.style).toMatchObject({ color: "blue" });
  });

  it("applies buttonColor when fundingSource is 'paylater'", () => {
    render(<PayPalMask fundingSource="paylater" />);

    expect(capturedProps.style).toMatchObject({ color: "blue" });
  });

  it("omits color for a fundingSource incompatible with the PayPal color palette", () => {
    render(<PayPalMask fundingSource="venmo" />);

    expect(capturedProps.style.color).toBeUndefined();
  });

  it("renders exactly one <PayPalButtons/> when no fundingSource is passed, letting the SDK auto-render every eligible funding source itself", () => {
    render(<PayPalMask />);

    // fundingSource must be a single FUNDING_SOURCE, not an array (see
    // @paypal/paypal-js's PayPalButtonFundingSource) — PayPalMask itself never fans out
    // multiple <PayPalButtons/> instances; showing more than one button from a single mount
    // relies entirely on the PayPal JS SDK's own auto-detection when fundingSource is omitted
    // (see PayPalBuilder.ts's ENABLER_DEFAULT_CONFIG).
    expect(capturedCalls).toHaveLength(1);
    expect(capturedProps.fundingSource).toBeUndefined();
  });
});

describe("PayPalMask button style — express builder always collapses to a single 'paypal' button", () => {
  beforeEach(() => {
    capturedProps = undefined;
    capturedCalls = [];
    mockHandleUpdateShipping.mockReset();
    mockResolveShippingOptionId
      .mockReset()
      .mockImplementation((id: string) => id);
    mockUsePayment.mockReset().mockReturnValue({
      ...basePaymentMock,
      builderType: "express",
    });
    mockUseSettings.mockReset().mockReturnValue({
      settings: {
        paypalButtonConfig: { buttonColor: "blue", buttonLabel: "buynow" },
      },
      paymentTokens: undefined,
    });
  });

  it("renders exactly one button for the express builder's default fundingSource", () => {
    render(<PayPalMask fundingSource="paypal" />);

    expect(capturedCalls).toHaveLength(1);
    expect(capturedProps.fundingSource).toBe("paypal");
    expect(capturedProps.style).toMatchObject({ color: "blue" });
  });
});
