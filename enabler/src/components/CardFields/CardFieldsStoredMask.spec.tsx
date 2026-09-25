import { render } from "@testing-library/react";

const mockUsePayment = jest.fn();
jest.mock("../../app/usePayment", () => ({
  usePayment: () => mockUsePayment(),
}));

const mockIsLoading = jest.fn();
jest.mock("../../app/useLoader", () => ({
  useLoader: () => ({ isLoading: mockIsLoading }),
}));

const mockRedirectTo = jest.fn();
jest.mock("../../helpers/redirectTo", () => ({
  redirectTo: (url: string) => mockRedirectTo(url),
}));

import { CardFieldsStoredMask } from "./CardFieldsStoredMask";

describe("CardFieldsStoredMask — registered submit handler", () => {
  const mockHandleCreateOrder = jest.fn();
  const mockOnError = jest.fn();
  let registeredSubmit: (() => Promise<void>) | undefined;

  beforeEach(() => {
    registeredSubmit = undefined;
    mockHandleCreateOrder.mockReset();
    mockOnError.mockReset();
    mockIsLoading.mockReset();
    mockRedirectTo.mockReset();
    mockUsePayment.mockReset().mockReturnValue({
      handleCreateOrder: mockHandleCreateOrder,
      orderDataLinks: undefined,
      orderId: undefined,
    });

    render(
      <CardFieldsStoredMask
        ppVaultTokenId="vault-token-id"
        onError={mockOnError}
        onRegisterSubmit={(handler) => {
          registeredSubmit = handler;
        }}
      />
    );
  });

  it("charges the stored token with isCheckoutCard=true, so handleCreateOrder rethrows instead of resolving an empty id", async () => {
    mockHandleCreateOrder.mockResolvedValue("order-1");

    await registeredSubmit!();

    expect(mockHandleCreateOrder).toHaveBeenCalledWith(
      { paymentSource: "card", storeInVault: false, vaultId: "vault-token-id" },
      true
    );
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockIsLoading).toHaveBeenLastCalledWith(false);
  });

  it("rejects, reports onError and clears the loader when the charge fails", async () => {
    mockHandleCreateOrder.mockRejectedValue(new Error("charge declined"));

    await expect(registeredSubmit!()).rejects.toThrow("charge declined");

    expect(mockOnError).toHaveBeenCalledWith({
      code: "charge declined",
      message: "charge declined",
    });
    expect(mockIsLoading).toHaveBeenLastCalledWith(false);
  });
});
