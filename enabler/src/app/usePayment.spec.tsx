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

import { processorRequest } from "../services/processorRequest";
import { PaymentProvider, usePayment } from "./usePayment";

const mockedProcessorRequest = processorRequest as jest.MockedFunction<
  typeof processorRequest
>;

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
      paypalData: { clientId: "client-1", currency: "EUR", intent: "CAPTURE" },
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
