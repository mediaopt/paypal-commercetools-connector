import { describe, test, expect, jest, afterEach } from "@jest/globals";
import * as ConfigModule from "../../src/config/config";
import {
  buildStandardScriptCartOverlay,
  buildExpressSdkOptions,
} from "../../src/utils/config.utils";

describe("config.utils", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("buildStandardScriptCartOverlay", () => {
    test("returns an empty object when no cart summary is available", () => {
      expect(buildStandardScriptCartOverlay(undefined)).toEqual({});
    });

    test("overlays currency and (in sandbox) buyerCountry from the cart", () => {
      // PAYPAL_ENVIRONMENT is unset in the test env, so getConfig().paypalEnvironment defaults to
      // "Sandbox" — buyerCountry is expected to be included.
      expect(
        buildStandardScriptCartOverlay({ currency: "USD", country: "US" })
      ).toEqual({ currency: "USD", buyerCountry: "US" });
    });

    test("omits currency when the cart has none", () => {
      expect(
        buildStandardScriptCartOverlay({ country: "US" })
      ).toEqual({ buyerCountry: "US" });
    });

    test("omits buyerCountry when the cart has no country", () => {
      expect(
        buildStandardScriptCartOverlay({ currency: "USD" })
      ).toEqual({ currency: "USD" });
    });

    test("never includes buyerCountry outside sandbox — PayPal's own docs say it's sandbox-only", () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        paypalEnvironment: "Production",
      });

      expect(
        buildStandardScriptCartOverlay({ currency: "USD", country: "US" })
      ).toEqual({ currency: "USD" });
    });
  });

  describe("buildExpressSdkOptions", () => {
    test("passes the configured expressSdkOptions through unmodified when the cart has no currency", () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        expressSdkOptions: { enableFunding: "venmo" },
      });

      expect(buildExpressSdkOptions(undefined)).toEqual({
        enableFunding: "venmo",
      });
      expect(buildExpressSdkOptions({})).toEqual({ enableFunding: "venmo" });
    });

    test("overlays the cart's currency onto expressSdkOptions, cart winning over the configured value", () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        expressSdkOptions: { enableFunding: "venmo", currency: "EUR" },
      });

      expect(buildExpressSdkOptions({ currency: "USD" })).toEqual({
        enableFunding: "venmo",
        currency: "USD",
      });
    });

    test("never overlays buyerCountry — PayPal Express is a different page/script with no reason to share sandbox testing concerns", () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        expressSdkOptions: {},
      });

      // buildExpressSdkOptions's own type only accepts `currency` in cartSummary — there is no
      // buyerCountry parameter to pass in the first place, unlike buildStandardScriptCartOverlay.
      expect(buildExpressSdkOptions({ currency: "USD" })).toEqual({
        currency: "USD",
      });
    });
  });

});
