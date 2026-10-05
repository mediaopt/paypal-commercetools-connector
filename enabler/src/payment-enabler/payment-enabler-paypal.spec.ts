jest.mock("../services/processorRequest", () => ({
  processorRequest: jest.fn(),
}));
jest.mock("../app/preloadPayPalScript", () => ({
  preloadPayPalScript: jest.fn(),
}));
// Captures the baseOptions each builder is constructed with
jest.mock("../components/PayPalBuilder", () => ({
  PayPalComponentBuilder: jest.fn(),
}));

import { PayPalPaymentEnabler } from "./payment-enabler-paypal";
import { processorRequest } from "../services/processorRequest";
import { preloadPayPalScript } from "../app/preloadPayPalScript";
import { PayPalComponentBuilder } from "../components/PayPalBuilder";
import { PARTNER_ATTRIBUTION_ID } from "../constants";
import { DEFAULT_SCRIPT_CURRENCY } from "../components/constants";
import { BaseOptions } from "./interfaces/baseOptions";

const mockedProcessorRequest = processorRequest as jest.MockedFunction<
  typeof processorRequest
>;
const mockedPreload = preloadPayPalScript as jest.MockedFunction<
  typeof preloadPayPalScript
>;
const MockedBuilder = PayPalComponentBuilder as unknown as jest.Mock;

const baseConfigJson = {
  clientId: "client-id",
  standardScriptOptions: {
    components: ["buttons"],
    disableFunding: ["sepa"],
  },
  expressSdkOptions: { currency: "USD" },
  settings: { payPalIntent: "Capture", merchantId: "merchant-1" },
  storedPaymentMethodsConfig: { isEnabled: true },
  enableVaulting: true,
  redirectOnApprove: false,
  userIdToken: "user-token",
};

const mockFetchOk = (json: Record<string, unknown>) => {
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => json,
  });
};

const buildEnabler = () =>
  new PayPalPaymentEnabler({
    processorUrl: "https://processor.example",
    sessionId: "session-id",
  } as any);

const lastBuilderArgs = (): [string, BaseOptions, string | undefined] =>
  MockedBuilder.mock.calls[MockedBuilder.mock.calls.length - 1];

// Standard setup: /operations/config + createPayment + shared script preload
const standardBaseOptions = async (enabler = buildEnabler()) => {
  await enabler.createComponentBuilder("paypal");
  return lastBuilderArgs()[1];
};

describe("PayPalPaymentEnabler standard setup (via createComponentBuilder)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPreload.mockResolvedValue(undefined);
    mockedProcessorRequest.mockResolvedValue({ id: "payment-id" } as any);
  });

  it("builds paypalScriptOptions from standardScriptOptions + settings, byte-identical to what useSettings.tsx's own merge separately produces for a standard component, and preloads it", async () => {
    mockFetchOk(baseConfigJson);

    const baseOptions = await standardBaseOptions();

    const expectedScriptOptions = {
      clientId: "client-id",
      currency: DEFAULT_SCRIPT_CURRENCY,
      components: ["buttons"],
      disableFunding: ["sepa"],
      intent: "capture",
      dataPartnerAttributionId: PARTNER_ATTRIBUTION_ID,
      merchantId: "merchant-1",
    };
    expect(mockedPreload).toHaveBeenCalledWith(expectedScriptOptions);
    expect(baseOptions.paypalScriptOptions).toEqual(expectedScriptOptions);
  });

  it("passes expressSdkOptions/standardScriptOptions through from the config response unchanged, for the Express-only/settings-driven consumers", async () => {
    mockFetchOk(baseConfigJson);

    const baseOptions = await standardBaseOptions();

    expect(baseOptions.expressSdkOptions).toEqual({ currency: "USD" });
    expect(baseOptions.standardScriptOptions).toEqual(
      baseConfigJson.standardScriptOptions
    );
  });

  it("falls back to DEFAULT_SCRIPT_CURRENCY when neither standardScriptOptions nor a component override sets currency", async () => {
    mockFetchOk({ ...baseConfigJson, standardScriptOptions: {} });

    const baseOptions = await standardBaseOptions();

    expect(baseOptions.paypalScriptOptions.currency).toBe(
      DEFAULT_SCRIPT_CURRENCY
    );
  });

  it("omits intent/merchantId (rather than inventing a value) when settings doesn't supply them", async () => {
    mockFetchOk({ ...baseConfigJson, settings: {} });

    const baseOptions = await standardBaseOptions();

    expect(baseOptions.paypalScriptOptions.intent).toBeUndefined();
    expect(baseOptions.paypalScriptOptions.merchantId).toBeUndefined();
  });

  it("seeds initialPayment from the createPayment response", async () => {
    mockFetchOk(baseConfigJson);

    const baseOptions = await standardBaseOptions();

    expect(baseOptions.initialPayment).toEqual({ id: "payment-id" });
  });

  it("runs payment creation and script preload in parallel via Promise.all, not sequentially", async () => {
    mockFetchOk(baseConfigJson);
    const order: string[] = [];
    mockedProcessorRequest.mockImplementation(async () => {
      order.push("payment:start");
      await Promise.resolve();
      order.push("payment:end");
      return { id: "payment-id" } as any;
    });
    mockedPreload.mockImplementation(async () => {
      order.push("script:start");
      await Promise.resolve();
      order.push("script:end");
    });

    await standardBaseOptions();

    // Both calls must have started before either finished — only possible if they were kicked
    // off together (Promise.all), not one awaited before the other begins.
    expect(order.indexOf("script:start")).toBeLessThan(
      order.indexOf("payment:end")
    );
    expect(order.indexOf("payment:start")).toBeLessThan(
      order.indexOf("script:end")
    );
  });

  it("rejects when the script preload fails, even though payment creation succeeds", async () => {
    mockFetchOk(baseConfigJson);
    mockedPreload.mockRejectedValue(new Error("script failed"));

    await expect(
      buildEnabler().createComponentBuilder("paypal")
    ).rejects.toThrow("script failed");
  });

  it("rejects when payment creation fails, even though the script preload succeeds", async () => {
    mockFetchOk(baseConfigJson);
    mockedProcessorRequest.mockResolvedValue(false);

    await expect(
      buildEnabler().createComponentBuilder("paypal")
    ).rejects.toThrow("Could not create payment");
  });

  it("rejects when /operations/config fails", async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 401 });

    await expect(
      buildEnabler().createComponentBuilder("paypal")
    ).rejects.toThrow("Could not fetch config");
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
  });
});

describe("PayPalPaymentEnabler lazy, shared setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPreload.mockResolvedValue(undefined);
    mockedProcessorRequest.mockResolvedValue({ id: "payment-id" } as any);
    mockFetchOk(baseConfigJson);
  });

  it("does nothing on construction — no config fetch, no payment, no script", () => {
    buildEnabler();

    expect((global as any).fetch).not.toHaveBeenCalled();
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it("fetches config and creates the payment only once across several standard builders", async () => {
    const enabler = buildEnabler();

    await enabler.createComponentBuilder("paypal");
    await enabler.createComponentBuilder("card");
    await enabler.isStoredPaymentMethodsEnabled();

    expect((global as any).fetch).toHaveBeenCalledTimes(1);
    expect(mockedProcessorRequest).toHaveBeenCalledTimes(1);
    expect(mockedPreload).toHaveBeenCalledTimes(1);
  });

  it("shares one config fetch between Express and standard builders", async () => {
    const enabler = buildEnabler();

    await enabler.createExpressBuilder("paypal");
    await enabler.createComponentBuilder("paypal");

    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });
});

describe("PayPalPaymentEnabler Express setup (via createExpressBuilder)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPreload.mockResolvedValue(undefined);
    mockedProcessorRequest.mockResolvedValue({ id: "payment-id" } as any);
    mockFetchOk(baseConfigJson);
  });

  it("fetches only /operations/config with the session header — no createPayment, no standard script preload", async () => {
    await buildEnabler().createExpressBuilder("paypal");

    expect((global as any).fetch).toHaveBeenCalledWith(
      "https://processor.example/operations/config",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "X-Session-Id": "session-id" }),
      })
    );
    expect(mockedProcessorRequest).not.toHaveBeenCalled();
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it("builds the express builder without initialPayment — its Payment is created on click", async () => {
    await buildEnabler().createExpressBuilder("paypal");

    const [paymentMethodType, baseOptions, builderType] = lastBuilderArgs();
    expect(paymentMethodType).toBe("PayPal");
    expect(builderType).toBe("express");
    expect(baseOptions.initialPayment).toBeUndefined();
    expect(baseOptions.expressSdkOptions).toEqual({ currency: "USD" });
  });

  it("still resolves when payment creation would fail for this session (e.g. a session without a Cart)", async () => {
    mockedProcessorRequest.mockResolvedValue(false);
    const enabler = buildEnabler();

    await expect(enabler.createExpressBuilder("paypal")).resolves.toBeDefined();
    await expect(enabler.createComponentBuilder("paypal")).rejects.toThrow(
      "Could not create payment"
    );
  });
});
