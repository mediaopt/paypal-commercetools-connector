jest.mock("../services/processorRequest", () => ({
  processorRequest: jest.fn(),
}));
jest.mock("../app/preloadPayPalScript", () => ({
  preloadPayPalScript: jest.fn(),
}));

import { PayPalPaymentEnabler } from "./payment-enabler-paypal";
import { processorRequest } from "../services/processorRequest";
import { preloadPayPalScript } from "../app/preloadPayPalScript";
import { PARTNER_ATTRIBUTION_ID } from "../constants";
import { DEFAULT_SCRIPT_CURRENCY } from "../components/constants";

const mockedProcessorRequest = processorRequest as jest.MockedFunction<
  typeof processorRequest
>;
const mockedPreload = preloadPayPalScript as jest.MockedFunction<
  typeof preloadPayPalScript
>;

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

describe("PayPalPaymentEnabler._Setup (via setupData)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPreload.mockResolvedValue(undefined);
    mockedProcessorRequest.mockResolvedValue({ id: "payment-id" } as any);
  });

  it("builds paypalScriptOptions from standardScriptOptions + settings, byte-identical to what useSettings.tsx's own merge separately produces for a standard component, and preloads it", async () => {
    mockFetchOk(baseConfigJson);

    const { baseOptions } = await buildEnabler().setupData;

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

    const { baseOptions } = await buildEnabler().setupData;

    expect(baseOptions.expressSdkOptions).toEqual({ currency: "USD" });
    expect(baseOptions.standardScriptOptions).toEqual(
      baseConfigJson.standardScriptOptions
    );
  });

  it("falls back to DEFAULT_SCRIPT_CURRENCY when neither standardScriptOptions nor a component override sets currency", async () => {
    mockFetchOk({ ...baseConfigJson, standardScriptOptions: {} });

    const { baseOptions } = await buildEnabler().setupData;

    expect(baseOptions.paypalScriptOptions.currency).toBe(
      DEFAULT_SCRIPT_CURRENCY
    );
  });

  it("omits intent/merchantId (rather than inventing a value) when settings doesn't supply them", async () => {
    mockFetchOk({ ...baseConfigJson, settings: {} });

    const { baseOptions } = await buildEnabler().setupData;

    expect(baseOptions.paypalScriptOptions.intent).toBeUndefined();
    expect(baseOptions.paypalScriptOptions.merchantId).toBeUndefined();
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

    await buildEnabler().setupData;

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

    await expect(buildEnabler().setupData).rejects.toThrow("script failed");
  });

  it("rejects when payment creation fails, even though the script preload succeeds", async () => {
    mockFetchOk(baseConfigJson);
    mockedProcessorRequest.mockResolvedValue(false);

    await expect(buildEnabler().setupData).rejects.toThrow(
      "Could not create payment"
    );
  });
});
