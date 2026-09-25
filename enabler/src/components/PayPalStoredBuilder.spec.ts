let capturedElement: any;
const mockRender = jest.fn((element: any) => {
  capturedElement = element;
});
const mockRoot = { render: mockRender, unmount: jest.fn() };

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => mockRoot),
}));

import { PayPalStoredBuilder } from "./PayPalStoredBuilder";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";

const baseOptions = (overrides: Partial<BaseOptions> = {}): BaseOptions =>
  ({
    processorUrl: "https://processor.example",
    sessionId: "session-id",
    sdkOptions: {},
    settings: {},
    ...overrides,
  } as BaseOptions);

describe("PayPalStoredBuilder", () => {
  beforeEach(() => {
    capturedElement = undefined;
    mockRender.mockClear();
    document.body.innerHTML = '<div id="stored-container"></div>';
  });

  it("forwards the stored payment method id as ppVaultTokenId", async () => {
    const component = new PayPalStoredBuilder(baseOptions()).build({
      id: "vault-token-id",
    } as never);
    await component.mount("#stored-container");

    expect(capturedElement.props.paymentMethodType).toBe("CardFieldsStored");
    expect(capturedElement.props.genericOptions.ppVaultTokenId).toBe(
      "vault-token-id"
    );
  });

  it("submit() rejects when no handler has been registered — nothing was charged, so it must not read as a success", async () => {
    const component = new PayPalStoredBuilder(baseOptions()).build({
      id: "vault-token-id",
    } as never);
    await component.mount("#stored-container");

    await expect(component.submit()).rejects.toThrow(
      "CardFieldsStored is not ready to submit — no handler registered"
    );
  });

  it("submit() delegates to the registered handler and propagates its rejection", async () => {
    const component = new PayPalStoredBuilder(baseOptions()).build({
      id: "vault-token-id",
    } as never);
    await component.mount("#stored-container");

    const submitHandler = jest
      .fn()
      .mockRejectedValue(new Error("charge failed"));
    capturedElement.props.genericOptions.onRegisterSubmit(submitHandler);

    await expect(component.submit()).rejects.toThrow("charge failed");
    expect(submitHandler).toHaveBeenCalledTimes(1);
  });

  it("genericOptions.onError is undefined when baseOptions.onError isn't supplied", async () => {
    const component = new PayPalStoredBuilder(baseOptions()).build({
      id: "vault-token-id",
    } as never);
    await component.mount("#stored-container");

    expect(capturedElement.props.genericOptions.onError).toBeUndefined();
  });

  it("genericOptions.onError adapts baseOptions.onError with the initial payment id as paymentReference", async () => {
    const enablerOnError = jest.fn();
    const component = new PayPalStoredBuilder(
      baseOptions({
        onError: enablerOnError,
        initialPayment: { id: "payment-id" } as BaseOptions["initialPayment"],
      })
    ).build({ id: "vault-token-id" } as never);
    await component.mount("#stored-container");

    const error = { code: "SOME_ERROR", message: "Something went wrong" };
    capturedElement.props.genericOptions.onError(error);

    expect(enablerOnError).toHaveBeenCalledWith(error, {
      paymentReference: "payment-id",
    });
  });
});
