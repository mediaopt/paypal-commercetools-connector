import { FC, useEffect } from "react";
import { render, waitFor } from "@testing-library/react";

import "../messages/i18n";

jest.mock("../services/processorRequest", () => ({
  processorRequest: jest.fn(),
}));
jest.mock("./useSettings", () => ({
  useSettings: jest.fn(() => ({ settings: undefined })),
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
import { useSettings } from "./useSettings";
import { PaymentProvider, usePayment } from "./usePayment";

const mockedProcessorRequest = processorRequest as jest.MockedFunction<
  typeof processorRequest
>;
const mockedRedirectTo = redirectTo as jest.MockedFunction<typeof redirectTo>;
const mockedUseSettings = useSettings as jest.Mock;

const CreateOrderConsumer: FC = () => {
  const { handleCreateOrder } = usePayment();
  useEffect(() => {
    handleCreateOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const CreateOrderWithDataConsumer: FC<{
  orderData?: Record<string, unknown>;
  forceCheckoutReportError?: boolean;
  onResult?: (result: string) => void;
  onError?: (error: unknown) => void;
}> = ({ orderData, forceCheckoutReportError, onResult, onError }) => {
  const { handleCreateOrder } = usePayment();
  useEffect(() => {
    handleCreateOrder(orderData as never, forceCheckoutReportError)
      .then((result) => onResult?.(result))
      .catch((error) => onError?.(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const OnApproveConsumer: FC<{
  forceCheckoutReportError?: boolean;
  onError?: (error: unknown) => void;
}> = ({ forceCheckoutReportError, onError }) => {
  const { handleOnApprove } = usePayment();
  useEffect(() => {
    handleOnApprove({ orderID: "order-1" }, forceCheckoutReportError).catch(
      (error) => onError?.(error)
    );
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

// Deriving createPaymentUrl/createOrderUrl/etc. from processorUrl is no longer PaymentProvider's
// job — RenderTemplate (Checkout-only) injects the already-resolved URL into these same named
// props upstream now, so PaymentProvider just uses whatever value it's given, same as a
// self-hosted merchant's own directly-supplied value. See RenderTemplate.spec.tsx for coverage of
// that injection, and "PaymentProvider auto-triggers createPayment on mount" above for coverage
// of this straightforward pass-through.

describe("PaymentProvider missing endpoint configuration", () => {
  // createPaymentUrl is required (no guard), so every test here supplies one and gets a real
  // createPayment response — each test's own focus (a *different* optional URL being
  // unconfigured) resolves silently, with no notify/console.error.
  const validCreatePaymentResponse = {
    id: "payment-1",
    paypalData: { clientId: "client-1", currency: "EUR" },
    amountPlanned: { centAmount: 1000, currencyCode: "EUR", fractionDigits: 2 },
  } as never;

  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockedProcessorRequest.mockResolvedValue(validCreatePaymentResponse);
    mockNotify.mockReset();
    mockedRedirectTo.mockClear();
  });

  it("handleCreateOrder silently no-ops (no processor call, no notify) when createOrderUrl is not configured", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderConsumer />
      </PaymentProvider>
    );

    // Only the initial createPayment call ever reaches the processor — createOrder no-ops silently.
    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalledTimes(1));
    expect(mockedProcessorRequest.mock.calls[0][1]).toBe(
      "https://processor.test/payments"
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("handleOnApprove silently no-ops (no processor call, no notify) when no approve/authorize/redirect URL is configured", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalledTimes(1));
    expect(mockedProcessorRequest.mock.calls[0][1]).toBe(
      "https://processor.test/payments"
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("handleOnApprove takes the legacy onApproveRedirectionUrl branch unchanged (no approve/authorize processor call)", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
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
    // Only the initial createPayment call should have reached the processor — the
    // onApproveRedirectionUrl branch itself never calls it for approve/authorize.
    expect(mockedProcessorRequest).toHaveBeenCalledTimes(1);
    expect(mockedProcessorRequest.mock.calls[0][1]).toBe(
      "https://processor.test/payments"
    );
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
        createPaymentUrl="https://processor.test/payments"
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

  it("handleCreateOrder short-circuits to the redirect when the response has a merchantReturnUrl, without running the normal success handling", async () => {
    // Branches on the requested URL rather than call order — createPayment (initPayment's own
    // effect) and createOrder (CreateOrderConsumer's effect) fire from sibling effects, whose
    // relative order isn't a contract worth depending on here.
    mockedProcessorRequest.mockImplementation((_header, url) =>
      Promise.resolve(
        url === "https://processor.test/payments/createOrder"
          ? ({
              orderData: {
                id: "order-1",
                status: "COMPLETED",
                payment_source: { card: {} },
              },
              merchantReturnUrl:
                "https://merchant.example.com/approve?paymentReference=payment-1",
            } as never)
          : validCreatePaymentResponse
      )
    );
    const purchaseCallback = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        createOrderUrl="https://processor.test/payments/createOrder"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={purchaseCallback}
      >
        <CreateOrderConsumer />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedRedirectTo).toHaveBeenCalledWith(
        "https://merchant.example.com/approve?paymentReference=payment-1"
      )
    );
    // If the merchantReturnUrl branch didn't return early, status === "COMPLETED" would have
    // triggered purchaseCallback via onSuccess — asserting it never fires confirms the early return.
    expect(purchaseCallback).not.toHaveBeenCalled();
  });

  it("handleCreateVaultSetupToken silently returns an empty string (no processor call, no notify) when createVaultSetupTokenUrl is not configured", async () => {
    const onResult = jest.fn();
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <VaultSetupTokenConsumer onResult={onResult} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(""));
    expect(mockNotify).not.toHaveBeenCalled();
    expect(mockedProcessorRequest).toHaveBeenCalledTimes(1);
    expect(mockedProcessorRequest.mock.calls[0][1]).toBe(
      "https://processor.test/payments"
    );
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

  it("logs expressApproveUrl's missing config and silently falls through (no approve/authorize call, no notify) when redirectOnApprove is true but no processorUrl is configured", async () => {
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

    // expressApproveUrl itself is still unaffected by this change — still logs a console.error.
    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("expressApproveUrl")
      )
    );
    // No legacy onApproveRedirectionUrl, and no authorizeOrderUrl/onApproveUrl configured either —
    // falls through to the silent no-op, not a notify.
    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalledTimes(1));
    expect(mockedProcessorRequest.mock.calls[0][1]).toBe(
      "https://processor.test/payments"
    );
    expect(mockNotify).not.toHaveBeenCalled();
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

describe("PaymentProvider handleCreateOrder forces Capture intent for PayUponInvoice orders", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockedProcessorRequest.mockResolvedValue(false);
    mockNotify.mockReset();
    // Real merchant-configured intent — must not reach the processor unchanged for a PUI order.
    mockedUseSettings.mockReturnValue({ settings: { payPalIntent: "Authorize" } });
  });

  afterEach(() => {
    mockedUseSettings.mockReturnValue({ settings: undefined });
  });

  it("submits payPalIntent: 'Capture' when orderData.fraudNetSessionId is present (PUI signal), overriding the real settings.payPalIntent — regression test for the two-script-tag crash", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createOrderUrl="https://processor.test/payments/order"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderWithDataConsumer
          orderData={{ fraudNetSessionId: "session-1" }}
        />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, , body] = mockedProcessorRequest.mock.calls[0];
    expect(body).toMatchObject({ payPalIntent: "Capture" });
  });

  it("leaves payPalIntent as the real settings.payPalIntent when orderData has no fraudNetSessionId (non-PUI orders)", async () => {
    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createOrderUrl="https://processor.test/payments/order"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderConsumer />
      </PaymentProvider>
    );

    await waitFor(() => expect(mockedProcessorRequest).toHaveBeenCalled());

    const [, , body] = mockedProcessorRequest.mock.calls[0];
    expect(body).toMatchObject({ payPalIntent: "Authorize" });
  });
});

// handleOnApprove resolves normally for a non-COMPLETED status and swallows errors after notifying,
// which tells a Checkout caller the payment succeeded. forceCheckoutReportError (passed only in
// Checkout mode) makes both paths reject instead.
describe("PaymentProvider handleOnApprove forceCheckoutReportError error propagation", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
  });

  it("rejects and logs the order status when forceCheckoutReportError is true and the order isn't COMPLETED", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    // Keyed by URL rather than call order — OnApproveConsumer's effect (a child of
    // PaymentProvider) fires before PaymentProvider's own initial createPayment effect, so
    // queued mockResolvedValueOnce values would be consumed out of the order they're declared in.
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/approve")
        ? Promise.resolve({
            orderData: { id: "order-1", status: "CREATED", message: "pending" },
          } as never)
        : Promise.resolve({
            id: "payment-1",
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        onApproveUrl="https://processor.test/payments/approve"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer forceCheckoutReportError onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("CREATED")
    );
    // The existing notify(...) still fires before the new rethrow — checkout callers keep the
    // same user-facing message, they just also now reject the promise.
    expect(mockNotify).toHaveBeenCalledWith("Error", expect.any(String));
    consoleErrorSpy.mockRestore();
  });

  it("resolves normally (no throw, no notify) for the same non-COMPLETED order when forceCheckoutReportError is not set — legacy/other callers unaffected", async () => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/approve")
        ? Promise.resolve({
            orderData: { id: "order-1", status: "CREATED", message: "pending" },
          } as never)
        : Promise.resolve({
            id: "payment-1",
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        onApproveUrl="https://processor.test/payments/approve"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockedProcessorRequest).toHaveBeenCalledTimes(2)
    );
    expect(onError).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("rethrows a failed processor call for forceCheckoutReportError callers instead of only notifying — any error, not just the non-COMPLETED case, must now fail the payment step", async () => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/approve")
        ? Promise.reject(new Error("network down"))
        : Promise.resolve({
            id: "payment-1",
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        onApproveUrl="https://processor.test/payments/approve"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer forceCheckoutReportError onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(mockNotify).toHaveBeenCalledWith("Error", "network down");
  });

  it("does not rethrow a failed processor call when forceCheckoutReportError is not set — matches today's behavior for other builders", async () => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/approve")
        ? Promise.reject(new Error("network down"))
        : Promise.resolve({
            id: "payment-1",
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        onApproveUrl="https://processor.test/payments/approve"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <OnApproveConsumer onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith("Error", "network down")
    );
    expect(onError).not.toHaveBeenCalled();
  });
});

// Same swallow-and-continue pattern in handleCreateOrder.
describe("PaymentProvider handleCreateOrder forceCheckoutReportError error propagation", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
  });

  it("rejects when createOrderUrl is not configured and forceCheckoutReportError is true, instead of silently resolving to an empty string", async () => {
    mockedProcessorRequest.mockResolvedValueOnce({
      id: "payment-1",
      amountPlanned: { centAmount: 1000, currencyCode: "EUR", fractionDigits: 2 },
    });
    const onResult = jest.fn();
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderWithDataConsumer
          forceCheckoutReportError
          onResult={onResult}
          onError={onError}
        />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(onResult).not.toHaveBeenCalled();
    // No processor call other than the initial createPayment — misconfiguration is detected
    // before ever reaching the try/catch, so there's nothing for notify to report either.
    expect(mockedProcessorRequest).toHaveBeenCalledTimes(1);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("still silently resolves to an empty string when createOrderUrl is not configured and forceCheckoutReportError is not set — legacy/other callers unaffected", async () => {
    mockedProcessorRequest.mockResolvedValueOnce({
      id: "payment-1",
      amountPlanned: { centAmount: 1000, currencyCode: "EUR", fractionDigits: 2 },
    });
    const onResult = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderWithDataConsumer onResult={onResult} />
      </PaymentProvider>
    );

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(""));
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("rejects when the processor response is missing an order id and forceCheckoutReportError is true (handleResponseError's own throw now propagates instead of being swallowed)", async () => {
    // Keyed by URL rather than call order — see the equivalent handleOnApprove tests above for why.
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/order")
        ? Promise.resolve({
            orderData: { message: "missing-id" },
            paymentVersion: 2,
          } as never)
        : Promise.resolve({
            id: "payment-1",
            amountPlanned: {
              centAmount: 1000,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          } as never)
    );
    const onError = jest.fn();

    render(
      <PaymentProvider
        options={{} as any}
        requestHeader={{}}
        createPaymentUrl="https://processor.test/payments"
        createOrderUrl="https://processor.test/payments/order"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderWithDataConsumer forceCheckoutReportError onError={onError} />
      </PaymentProvider>
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(mockNotify).toHaveBeenCalledWith("Error", "missing-id");
  });
});

describe("PaymentProvider handleCreateOrder PayUponInvoice error response", () => {
  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
  });

  const renderPuiOrder = (
    forceCheckoutReportError: boolean | undefined,
    onResult: jest.Mock,
    onError: jest.Mock
  ) => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/order")
        ? Promise.resolve({
            orderData: { message: "UNKNOWN_RATEPAY_ERROR" },
          } as never)
        : Promise.resolve({
            id: "payment-1",
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
        createPaymentUrl="https://processor.test/payments"
        createOrderUrl="https://processor.test/payments/order"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={() => {}}
      >
        <CreateOrderWithDataConsumer
          orderData={{
            fraudNetSessionId: "session-1",
            setRatepayMessage: jest.fn(),
          }}
          forceCheckoutReportError={forceCheckoutReportError}
          onResult={onResult}
          onError={onError}
        />
      </PaymentProvider>
    );
  };

  it("rejects with forceCheckoutReportError, notifying only once (handleResponseError already showed the error)", async () => {
    const onResult = jest.fn();
    const onError = jest.fn();
    renderPuiOrder(true, onResult, onError);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(onResult).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  it("resolves to an empty string without forceCheckoutReportError — legacy callers unaffected", async () => {
    const onResult = jest.fn();
    const onError = jest.fn();
    renderPuiOrder(undefined, onResult, onError);

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(""));
    expect(onError).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledTimes(1);
  });
});

describe("PaymentProvider handleCreateOrder Google Pay APPROVED", () => {
  const confirmOrder = jest.fn();

  beforeEach(() => {
    mockedProcessorRequest.mockReset();
    mockNotify.mockReset();
    confirmOrder.mockReset().mockResolvedValue({ status: "APPROVED" });
    (globalThis as any).paypal = { Googlepay: () => ({ confirmOrder }) };
  });

  afterEach(() => {
    delete (globalThis as any).paypal;
  });

  const renderGooglePayOrder = (
    approveStatus: string,
    purchaseCallback: jest.Mock,
    onResult: jest.Mock,
    onError: jest.Mock
  ) => {
    mockedProcessorRequest.mockImplementation((_header, url) =>
      (url as string).includes("/order")
        ? Promise.resolve({
            orderData: { id: "order-1", status: "CREATED" },
          } as never)
        : (url as string).includes("/approve")
        ? Promise.resolve({
            orderData: { id: "order-1", status: approveStatus },
          } as never)
        : Promise.resolve({
            id: "payment-1",
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
        createPaymentUrl="https://processor.test/payments"
        createOrderUrl="https://processor.test/payments/order"
        onApproveUrl="https://processor.test/payments/approve"
        getSettingsUrl="https://processor.test/settings"
        shippingMethodId="standard"
        purchaseCallback={purchaseCallback}
      >
        <CreateOrderWithDataConsumer
          orderData={{
            paymentSource: "google_pay",
            googlePayData: { paymentData: { paymentMethodData: {} } },
          }}
          forceCheckoutReportError
          onResult={onResult}
          onError={onError}
        />
      </PaymentProvider>
    );
  };

  it("waits for the approval and fires purchaseCallback exactly once on success", async () => {
    const purchaseCallback = jest.fn();
    const onResult = jest.fn();
    const onError = jest.fn();
    renderGooglePayOrder("COMPLETED", purchaseCallback, onResult, onError);

    await waitFor(() => expect(onResult).toHaveBeenCalledWith("order-1"));
    expect(purchaseCallback).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("rejects with forceCheckoutReportError when the approval doesn't complete, without firing purchaseCallback or a second notification", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const purchaseCallback = jest.fn();
    const onResult = jest.fn();
    const onError = jest.fn();
    renderGooglePayOrder("DECLINED", purchaseCallback, onResult, onError);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(purchaseCallback).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});
