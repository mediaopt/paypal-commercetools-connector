import { act, fireEvent, render, screen } from "@testing-library/react";

let capturedProviderProps: any;

jest.mock("@paypal/react-paypal-js", () => {
  // Must be a stable reference across renders — a fresh object literal here would make
  // CardFieldsFormSync's `useEffect(..., [cardFieldsForm, fields])` see a "changed" dependency
  // on every render (referential inequality), causing an infinite update loop.
  const stableCardFieldsResult = { cardFieldsForm: null, fields: {} };
  return {
    PayPalCardFieldsProvider: (props: any) => {
      capturedProviderProps = props;
      return props.children;
    },
    PayPalNameField: () => null,
    PayPalNumberField: () => null,
    PayPalCVVField: () => null,
    PayPalExpiryField: () => null,
    usePayPalCardFields: () => stableCardFieldsResult,
    usePayPalScriptReducer: () => [{ isResolved: true }, jest.fn()],
  };
});

const mockErrorFunc = jest.fn();
jest.mock("../errorNotification", () => ({
  errorFunc: (...args: unknown[]) => mockErrorFunc(...args),
}));

const mockHandleAuthenticateThreeDSOrder = jest.fn();
const mockUsePayment = jest.fn();
jest.mock("../../app/usePayment", () => ({
  usePayment: () => mockUsePayment(),
}));

const mockNotify = jest.fn();
jest.mock("../../app/useNotifications", () => ({
  useNotifications: () => ({ notify: mockNotify }),
}));

const mockIsLoading = jest.fn();
jest.mock("../../app/useLoader", () => ({
  useLoader: () => ({ isLoading: mockIsLoading }),
}));

const mockUseSettings = jest.fn();
jest.mock("../../app/useSettings", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { CardFieldsMask } from "./CardFieldsMask";

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("CardFieldsMask — Checkout-facing onError signal on payment failure", () => {
  const mockOnError = jest.fn();

  beforeEach(() => {
    capturedProviderProps = undefined;
    mockErrorFunc.mockReset().mockReturnValue({
      code: "MOCK_SDK_ERROR",
      message: "resolved sdk error message",
    });
    mockHandleAuthenticateThreeDSOrder.mockReset();
    mockNotify.mockReset();
    mockIsLoading.mockReset();
    mockOnError.mockReset();
    mockUsePayment.mockReset().mockReturnValue({
      handleCreateOrder: jest.fn().mockResolvedValue("order-1"),
      handleOnApprove: jest.fn().mockResolvedValue(undefined),
      handleAuthenticateThreeDSOrder: mockHandleAuthenticateThreeDSOrder,
      vaultOnly: false,
      handleApproveVaultSetupToken: jest.fn(),
      handleCreateVaultSetupToken: jest.fn(),
      orderDataLinks: undefined,
      orderId: undefined,
    });
    mockUseSettings.mockReset().mockReturnValue({
      settings: { threeDSOption: "SCA_ALWAYS" },
      paymentTokens: undefined,
    });

    render(
      <CardFieldsMask onRegisterSubmit={jest.fn()} onError={mockOnError} />
    );
  });

  it("reports a declined 3DS result (select-different-method case) to Checkout via onError, without touching the existing local notify/loader behavior", async () => {
    mockHandleAuthenticateThreeDSOrder.mockResolvedValue(0);

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });

    expect(mockNotify).toHaveBeenCalledWith(
      "Error",
      "cardFields.selectDifferentMethod"
    );
    expect(mockIsLoading).toHaveBeenCalledWith(false);
    expect(mockOnError).toHaveBeenCalledWith({
      code: "THREE_DS_DECLINED",
      message: "cardFields.selectDifferentMethod",
    });
  });

  it("reports a declined 3DS result (retry case) to Checkout via onError", async () => {
    mockHandleAuthenticateThreeDSOrder.mockResolvedValue(1);

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });

    expect(mockNotify).toHaveBeenCalledWith("Warning", "cardFields.tryAgain");
    expect(mockOnError).toHaveBeenCalledWith({
      code: "THREE_DS_DECLINED_RETRY",
      message: "cardFields.tryAgain",
    });
  });

  it("does not report anything to Checkout when the 3DS result approves the order", async () => {
    mockHandleAuthenticateThreeDSOrder.mockResolvedValue(2);

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });

    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("reports a rejected 3DS authentication call to Checkout via onError, using errorFunc's resolved GenericError", async () => {
    mockHandleAuthenticateThreeDSOrder.mockRejectedValue(
      new Error("3ds call failed")
    );

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });

    expect(mockErrorFunc).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith({
      code: "MOCK_SDK_ERROR",
      message: "resolved sdk error message",
    });
  });

  it("reports a PayPal Card Fields SDK-internal error (e.g. a card validation failure) to Checkout via onError", () => {
    act(() => {
      capturedProviderProps.onError({ message: "generalError" });
    });

    expect(mockErrorFunc).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith({
      code: "MOCK_SDK_ERROR",
      message: "resolved sdk error message",
    });
  });
});

// Regression coverage for: Card Fields checkout never completing when the PayPal order isn't
// approved yet. forceCheckoutReportError (usePayment's flag for handleCreateOrder/handleOnApprove)
// must be derived from onRegisterSubmit — the same signal this file already uses everywhere else
// to tell Checkout mode from legacy/self-hosted mode (see the header comment above).
describe("CardFieldsMask — passes forceCheckoutReportError (derived from onRegisterSubmit) through to handleCreateOrder/handleOnApprove", () => {
  const mockHandleCreateOrder = jest.fn();
  const mockHandleOnApprove = jest.fn();

  beforeEach(() => {
    capturedProviderProps = undefined;
    mockHandleCreateOrder.mockReset().mockResolvedValue("order-1");
    mockHandleOnApprove.mockReset().mockResolvedValue(undefined);
    mockNotify.mockReset();
    mockIsLoading.mockReset();
    mockUsePayment.mockReset().mockReturnValue({
      handleCreateOrder: mockHandleCreateOrder,
      handleOnApprove: mockHandleOnApprove,
      handleAuthenticateThreeDSOrder: jest.fn(),
      vaultOnly: false,
      handleApproveVaultSetupToken: jest.fn(),
      handleCreateVaultSetupToken: jest.fn(),
      orderDataLinks: undefined,
      orderId: undefined,
    });
    mockUseSettings.mockReset().mockReturnValue({
      settings: undefined,
      paymentTokens: undefined,
    });
  });

  it("passes forceCheckoutReportError=true in Checkout mode (onRegisterSubmit supplied)", async () => {
    render(<CardFieldsMask onRegisterSubmit={jest.fn()} />);

    capturedProviderProps.createOrder();
    expect(mockHandleCreateOrder).toHaveBeenCalledWith(
      {
        paymentSource: "card",
        storeInVault: false,
        verificationMethod: undefined,
      },
      true
    );

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });
    expect(mockHandleOnApprove).toHaveBeenCalledWith(
      { orderID: "order-1", saveCard: false },
      true
    );
  });

  it("passes forceCheckoutReportError=false in legacy/self-hosted mode (no onRegisterSubmit)", async () => {
    render(<CardFieldsMask />);
    // The checkout-relevant createOrder/onApprove block only renders once a card is being
    // added — in legacy mode that's driven by picking "Add a new card" from the saved-card table.
    fireEvent.click(screen.getByLabelText("cardFields.addNewCard"));

    capturedProviderProps.createOrder();
    expect(mockHandleCreateOrder).toHaveBeenCalledWith(
      {
        paymentSource: "card",
        storeInVault: false,
        verificationMethod: undefined,
      },
      false
    );

    await act(async () => {
      capturedProviderProps.onApprove({ orderID: "order-1" });
      await flushMicrotasks();
    });
    expect(mockHandleOnApprove).toHaveBeenCalledWith(
      { orderID: "order-1", saveCard: false },
      false
    );
  });
});
