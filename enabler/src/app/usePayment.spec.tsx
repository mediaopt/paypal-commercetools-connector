import { FC, useEffect } from "react";
import { render, waitFor } from "@testing-library/react";

import "../messages/i18n";

jest.mock("../services/processorRequest", () => ({
  processorRequest: jest.fn(),
}));
jest.mock("./useSettings", () => ({
  useSettings: () => ({ settings: undefined }),
}));
const mockNotify = jest.fn();
jest.mock("./useNotifications", () => ({
  useNotifications: () => ({ notify: mockNotify }),
}));
jest.mock("../helpers/redirectTo", () => ({
  redirectTo: jest.fn(),
}));

import { processorRequest } from "../services/processorRequest";
import { redirectTo } from "../helpers/redirectTo";
import { PaymentProvider, usePayment } from "./usePayment";

const mockedProcessorRequest = processorRequest as jest.MockedFunction<
  typeof processorRequest
>;
const mockedRedirectTo = redirectTo as jest.MockedFunction<typeof redirectTo>;

const CreateOrderConsumer: FC = () => {
  const { handleCreateOrder } = usePayment();
  useEffect(() => {
    handleCreateOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const OnApproveConsumer: FC = () => {
  const { handleOnApprove } = usePayment();
  useEffect(() => {
    handleOnApprove({ orderID: "order-1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const VaultSetupTokenConsumer: FC<{
  onResult?: (result: unknown) => void;
}> = ({ onResult }) => {
  const { handleCreateVaultSetupToken } = usePayment();
  useEffect(() => {
    handleCreateVaultSetupToken("paypal").then((result) => onResult?.(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const PaymentInfoConsumer: FC<{
  onPaymentInfo: (paymentInfo: unknown) => void;
}> = ({ onPaymentInfo }) => {
  const { paymentInfo } = usePayment();
  useEffect(() => {
    onPaymentInfo(paymentInfo);
  }, [paymentInfo, onPaymentInfo]);
  return null;
};

// Waits for the initial createPayment call (paymentInfo.id) to resolve before calling
// handleUpdateShipping, so the processorRequest mock queue order is deterministic
// (createPayment always first) rather than depending on React's child-before-parent
// effect-ordering.
const UpdateShippingConsumer: FC<{
  onResult?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  request?: { orderID: string; address?: { countryCode: string }; shippingMethodId?: string };
}> = ({
  onResult,
  onError,
  request = { orderID: "order-1", address: { countryCode: "US" } },
}) => {
  const { handleUpdateShipping, paymentInfo } = usePayment();
  useEffect(() => {
    if (!paymentInfo.id) return;
    handleUpdateShipping(request)
      .then((result) => onResult?.(result))
      .catch((error) => onError?.(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInfo.id]);
  return null;
};

// Waits for paymentInfo.shippingOptions to be populated before validating selectedOptionId
// against it, so this doesn't race the initial createPayment response.
const ResolveShippingOptionIdConsumer: FC<{
  selectedOptionId: string;
  onResult?: (result: string) => void;
  onError?: (error: unknown) => void;
}> = ({ selectedOptionId, onResult, onError }) => {
  const { resolveShippingOptionId, paymentInfo } = usePayment();
  useEffect(() => {
    if (!paymentInfo.shippingOptions) return;
    try {
      // Resolve unconditionally before the optional onResult call — `onResult?.(fn())`
      // would short-circuit and never invoke fn() at all when onResult is undefined,
      // which is exactly the case in the "throws" test below.
      const result = resolveShippingOptionId(selectedOptionId);
      onResult?.(result);
    } catch (error) {
      onError?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInfo.shippingOptions]);
  return null;
};

describe("PaymentProvider auto-triggers createPayment on mount", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockedProcessorRequest.mockResolvedValue(false);
    mockNotify.mockReset();
  });

  it("includes paymentMethodType and builderType in the createPayment request body — regression test for 'A value is required for field paymentMethodType'", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType={undefined}
      >
        {null}
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, , body] = mockedProcessorRequest.mock.calls[0];
    expect(body).toMatchObject({ paymentMethodType: "PayPal" });
    expect(body).toHaveProperty("builderType");
  });

  it("forwards a non-default builderType (e.g. express) through unchanged", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        {null}
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, , body] = mockedProcessorRequest.mock.calls[0];
    expect(body).toMatchObject({
      paymentMethodType: "PayPal",
      builderType: "express",
    });
  });

  it("populates paymentInfo.id/amountPlanned from a real processor-shaped response — regression test for the amountPlanned-undefined crash", async () => {
    mockedProcessorRequest.mockResolvedValue({
      paypalData: { clientId: "client-1", currency: "EUR" },
      id: "payment-1",
      amountPlanned: {
        centAmount: 1000,
        currencyCode: "EUR",
        fractionDigits: 2,
      },
    });
    const onPaymentInfo = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
      >
        <PaymentInfoConsumer onPaymentInfo={onPaymentInfo} />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(onPaymentInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "payment-1",
          amountPlanned: {
            centAmount: 1000,
            currencyCode: "EUR",
            fractionDigits: 2,
          },
        })
      )
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });
});

describe("PaymentProvider resolving URLs via processorUrl", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockedProcessorRequest.mockResolvedValue(false);
    mockNotify.mockReset();
  });

  it("derives createPaymentUrl from processorUrl when no legacy createPaymentUrl is passed", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
      >
        {null}
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, url] = mockedProcessorRequest.mock.calls[0];
    expect(url).toBe("https://processor.test/payments");
  });

  it("derives createOrderUrl from processorUrl when no legacy createOrderUrl is passed", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderConsumer />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, url] = mockedProcessorRequest.mock.calls[0];
    expect(url).toBe("https://processor.test/payments/createOrder");
  });
});

describe("PaymentProvider missing endpoint configuration", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
    mockedRedirectTo.mockClear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("handleCreatePayment logs and notifies instead of calling the processor when neither processorUrl nor createPaymentUrl is configured", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
      >
        {null}
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        "Error",
        "Something went wrong. Please try again later."
      )
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });

  it("handleCreateOrder logs and notifies instead of calling the processor when neither processorUrl nor createOrderUrl is configured", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        "Error",
        "Something went wrong. Please try again later."
      )
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });

  it("handleOnApprove logs and notifies instead of calling the processor when no approve/authorize/redirect URL is configured", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        "Error",
        "Something went wrong. Please try again later."
      )
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });

  it("handleOnApprove takes the legacy onApproveRedirectionUrl branch unchanged (no processor call at all)", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        onApproveRedirectionUrl="https://merchant.example.com/review"
        builderType="express"
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedRedirectTo).toHaveBeenCalledWith(
        "https://merchant.example.com/review?order_id=order-1"
      )
    );
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });

  it("handleOnApprove short-circuits to the redirect when the response has a merchantReturnUrl, without running the normal success handling", async () => {
    mockedProcessorRequest.mockResolvedValue({
      orderData: { id: "order-1", status: "COMPLETED" },
      merchantReturnUrl:
        "https://merchant.example.com/approve?paymentReference=payment-1",
    } as never);
    const purchaseCallback = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        onApproveUrl="https://processor.test/payments/approve"
        shippingMethodId="standard"
        purchaseCallback={purchaseCallback}
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedRedirectTo).toHaveBeenCalledWith(
        "https://merchant.example.com/approve?paymentReference=payment-1"
      )
    );
    // If the merchantReturnUrl branch didn't return early, orderData.status === "COMPLETED" would
    // have triggered purchaseCallback — asserting it never fires confirms the early return.
    expect(purchaseCallback).not.toHaveBeenCalled();
  });

  it("handleCreateVaultSetupToken logs and returns an empty string when createVaultSetupTokenUrl is not configured", async () => {
    const onResult = jest.fn();
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <VaultSetupTokenConsumer onResult={onResult} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(""));
    expect(mockNotify).toHaveBeenCalledWith(
      "Error",
      "Something went wrong. Please try again later."
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });
});

describe("PaymentProvider PayPal Express redirect-before-finalize (expressApprove)", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
    mockedRedirectTo.mockClear();
  });

  it("calls the processor's expressApprove (not authorize/capture) and short-circuits when builderType is express and redirectOnApprove is true", async () => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("expressApprove")
        ? Promise.resolve({
            onApproveRedirectionUrl: "https://merchant.example.com/review",
          } as never)
        : Promise.resolve({
            id: "payment-1",
            paypalData: { clientId: "client-1", currency: "EUR" },
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const purchaseCallback = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={purchaseCallback}
        processorUrl="https://processor.test"
        builderType="express"
        redirectOnApprove={true}
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedProcessorRequest).toHaveBeenCalledWith(
        {},
        "https://processor.test/payments/expressApprove",
        expect.objectContaining({ orderID: "order-1" })
      )
    );
    await waitFor(() =>
      expect(mockedRedirectTo).toHaveBeenCalledWith(
        "https://merchant.example.com/review"
      )
    );
    // Same signal as the legacy-redirect test above: the normal success handling (which would call
    // purchaseCallback) never runs, confirming the early return after redirect.
    expect(purchaseCallback).not.toHaveBeenCalled();
  });

  it("prefers expressApprove over the legacy onApproveRedirectionUrl prop when both are configured", async () => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("expressApprove")
        ? Promise.resolve({
            onApproveRedirectionUrl: "https://merchant.example.com/review",
          } as never)
        : Promise.resolve({
            id: "payment-1",
            paypalData: { clientId: "client-1", currency: "EUR" },
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        processorUrl="https://processor.test"
        builderType="express"
        redirectOnApprove={true}
        onApproveRedirectionUrl="https://legacy.example.com/review"
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedProcessorRequest).toHaveBeenCalledWith(
        {},
        "https://processor.test/payments/expressApprove",
        expect.anything()
      )
    );
    // Confirms the actual navigation target is expressApprove's result, not just that its endpoint
    // was called — the legacy onApproveRedirectionUrl prop's URL must never be used here.
    await waitFor(() =>
      expect(mockedRedirectTo).toHaveBeenCalledWith(
        "https://merchant.example.com/review"
      )
    );
  });

  it("logs and falls through to the normal missing-config handling when redirectOnApprove is true but no processorUrl is configured", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation();
    mockedProcessorRequest.mockResolvedValue({
      id: "payment-1",
      paypalData: { clientId: "client-1", currency: "EUR" },
      amountPlanned: { centAmount: 1000, currencyCode: "EUR", fractionDigits: 2 },
    } as never);

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        createPaymentUrl="https://processor.test/payments"
        builderType="express"
        redirectOnApprove={true}
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        "Error",
        "Something went wrong. Please try again later."
      )
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("expressApproveUrl")
    );
    consoleErrorSpy.mockRestore();
  });
});

describe("PaymentProvider vaultOnly with legacy-only vault URLs", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockedProcessorRequest.mockResolvedValue({
      createVaultSetupTokenResponse: { id: "vault-setup-token-1" },
      version: 1,
    });
    mockNotify.mockReset();
  });

  it("handleCreateVaultSetupToken calls the legacy createVaultSetupTokenUrl when processorUrl has no derived counterpart", async () => {
    const onResult = jest.fn();
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createVaultSetupTokenUrl="https://legacy.test/create-vault-setup-token"
        approveVaultSetupTokenUrl="https://legacy.test/approve-vault-setup-token"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <VaultSetupTokenConsumer onResult={onResult} />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, url] = mockedProcessorRequest.mock.calls[0];
    expect(url).toBe("https://legacy.test/create-vault-setup-token");
    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith("vault-setup-token-1")
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("does not auto-trigger createPayment on mount when vaultOnly", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        createVaultSetupTokenUrl="https://legacy.test/create-vault-setup-token"
        approveVaultSetupTokenUrl="https://legacy.test/approve-vault-setup-token"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        {null}
      </PaymentProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedProcessorRequest).not.toHaveBeenCalledWith(
      expect.anything(),
      "https://processor.test/payments",
      expect.anything()
    );
  });
});

describe("PaymentProvider handleUpdateShipping", () => {
  const shippingOption = {
    id: "standard",
    label: "Standard",
    type: "SHIPPING" as const,
    amount: { currency_code: "USD", value: "5.00" },
    selected: true,
  };

  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
  });

  it("resolves with the processor's response and syncs paymentInfo.shippingOptions on success", async () => {
    const shippingResponse = {
      shippingOptions: [shippingOption],
      amount: { currency_code: "USD", value: "15.00" },
      breakdown: { shipping: { currency_code: "USD", value: "5.00" } },
    };
    mockedProcessorRequest
      .mockResolvedValueOnce({
        id: "payment-1",
        amountPlanned: {
          centAmount: 1000,
          currencyCode: "USD",
          fractionDigits: 2,
        },
      })
      .mockResolvedValueOnce(shippingResponse as never);

    const onResult = jest.fn();
    const onPaymentInfo = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <PaymentInfoConsumer onPaymentInfo={onPaymentInfo} />
        <UpdateShippingConsumer onResult={onResult} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(shippingResponse));

    const [, url, body] = mockedProcessorRequest.mock.calls[1];
    expect(url).toBe("https://processor.test/payments/updateShipping");
    expect(body).toMatchObject({
      orderID: "order-1",
      address: { countryCode: "US" },
    });

    // paymentInfo.shippingOptions must reflect the fresh list from the response, so a
    // subsequent onShippingOptionsChange call can resolve the buyer's pick correctly.
    await waitFor(() =>
      expect(onPaymentInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          shippingOptions: shippingResponse.shippingOptions,
        })
      )
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("echoes paymentInfo.shippingOptions in the wire request body when already known — lets the processor skip re-querying commercetools for a pure option-change", async () => {
    const cachedOptions = [shippingOption];
    mockedProcessorRequest
      .mockResolvedValueOnce({
        id: "payment-1",
        amountPlanned: {
          centAmount: 1000,
          currencyCode: "USD",
          fractionDigits: 2,
        },
        shippingOptions: cachedOptions,
      })
      .mockResolvedValueOnce({
        shippingOptions: cachedOptions,
        amount: { currency_code: "USD", value: "5.00" },
        breakdown: { shipping: { currency_code: "USD", value: "5.00" } },
      });

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <UpdateShippingConsumer
          onResult={jest.fn()}
          request={{ orderID: "order-1", shippingMethodId: "standard" }}
        />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalledTimes(2));

    const [, , body] = mockedProcessorRequest.mock.calls[1];
    expect(body).toMatchObject({ shippingOptions: cachedOptions });
  });

  it("omits shippingOptions from the wire request body for an address-change call, even though it's cached", async () => {
    const cachedOptions = [shippingOption];
    mockedProcessorRequest
      .mockResolvedValueOnce({
        id: "payment-1",
        amountPlanned: {
          centAmount: 1000,
          currencyCode: "USD",
          fractionDigits: 2,
        },
        shippingOptions: cachedOptions,
      })
      .mockResolvedValueOnce({
        shippingOptions: cachedOptions,
        amount: { currency_code: "USD", value: "5.00" },
        breakdown: { shipping: { currency_code: "USD", value: "5.00" } },
      });

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <UpdateShippingConsumer onResult={jest.fn()} />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalledTimes(2));

    const [, , body] = mockedProcessorRequest.mock.calls[1];
    expect(body).not.toHaveProperty("shippingOptions");
  });

  it("throws and notifies when the processor call fails", async () => {
    mockedProcessorRequest
      .mockResolvedValueOnce({
        id: "payment-1",
        amountPlanned: {
          centAmount: 1000,
          currencyCode: "USD",
          fractionDigits: 2,
        },
      })
      .mockResolvedValueOnce(false);

    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <UpdateShippingConsumer onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(mockNotify).toHaveBeenCalledWith("Error", expect.any(String));
  });
});

describe("PaymentProvider resolveShippingOptionId", () => {
  const shippingOptions = [
    {
      id: "standard",
      label: "Standard",
      type: "SHIPPING" as const,
      amount: { currency_code: "USD", value: "5.00" },
      selected: true,
    },
  ];

  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
  });

  it("resolves a known shipping option id from paymentInfo.shippingOptions", async () => {
    mockedProcessorRequest.mockResolvedValueOnce({
      id: "payment-1",
      amountPlanned: {
        centAmount: 1000,
        currencyCode: "USD",
        fractionDigits: 2,
      },
      shippingOptions,
    });

    const onResult = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <ResolveShippingOptionIdConsumer
          selectedOptionId="standard"
          onResult={onResult}
        />
      </PaymentProvider>
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith("standard"));
  });

  it("throws for a shipping option id not present in paymentInfo.shippingOptions", async () => {
    mockedProcessorRequest.mockResolvedValueOnce({
      id: "payment-1",
      amountPlanned: {
        centAmount: 1000,
        currencyCode: "USD",
        fractionDigits: 2,
      },
      shippingOptions,
    });

    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        processorUrl="https://processor.test"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
        paymentMethodType="PayPal"
        builderType="express"
      >
        <ResolveShippingOptionIdConsumer
          selectedOptionId="unknown-option"
          onError={onError}
        />
      </PaymentProvider>
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});
