import {
  EnablerOptions,
  PaymentComponentBuilder,
  PaymentEnabler,
} from "./interfaces/enabler";

import { DropinType, PaymentDropinBuilder } from "./interfaces/dropin";
import { PaymentExpressBuilder } from "./interfaces/express";
import {
  StoredComponentBuilder,
  StoredPaymentMethod,
} from "./interfaces/stored";
import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import { BaseOptions } from "./interfaces/baseOptions";
import { PayPalComponentBuilder } from "../components/PayPalBuilder";
import { PayPalStoredBuilder } from "../components/PayPalStoredBuilder";
import {
  DEFAULT_SCRIPT_CURRENCY,
  processorUrls,
} from "../components/constants";
import { PARTNER_ATTRIBUTION_ID } from "../constants";
import { sessionHeader } from "../helpers/sessionHeader";
import { toPayPalPaymentMethodType } from "../components/paymentMethodTypeMapping";
import { processorRequest } from "../services/processorRequest";
import { preloadPayPalScript } from "../app/preloadPayPalScript";
import { CreatePaymentResponse } from "../types";

export type {
  PayPalPaymentMethodType,
  PayPalPaymentMethodExpressType,
} from "../types";

export class PayPalPaymentEnabler implements PaymentEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: BaseOptions) {
    this.setupData = PayPalPaymentEnabler._Setup(options);
  }

  private static _Setup = async (
    options: EnablerOptions
  ): Promise<{ baseOptions: BaseOptions }> => {
    try {
      // Fetch SDK config from processor
      const configResponse = await fetch(
        options.processorUrl + "/operations/config",
        {
          method: "GET",
          headers: sessionHeader(options.sessionId),
        }
      );

      if (!configResponse.ok) {
        throw new Error("Could not fetch config");
      }

      const configJson = await configResponse.json();

      // Every standard (non-express, non-stored) component shares this ONE script config,
      // resolved once here instead of per-component in resolveOptions.ts — see
      // BaseOptions.paypalScriptOptions for the full reasoning. Deliberately built to be
      // byte-identical to what useSettings.tsx's own <PayPalScriptProvider> merge later produces
      // for a standard component (same intent/dataPartnerAttributionId/merchantId, computed the
      // same way) — see that merge's own comment for why matching matters here.
      const paypalScriptOptions: ReactPayPalScriptOptions = {
        clientId: configJson.clientId || "",
        currency: DEFAULT_SCRIPT_CURRENCY,
        ...configJson.standardScriptOptions,
        intent: configJson.settings?.payPalIntent?.toString().toLowerCase(),
        dataPartnerAttributionId: PARTNER_ATTRIBUTION_ID,
        // An unconfigured merchantId resolves to "" from the processor
        merchantId: configJson.settings?.merchantId?.length
          ? configJson.settings?.merchantId
          : undefined,
      };

      // One shared commercetools Payment per checkout page load, shared by every standard/stored/
      // express builder resolving this same setupData; and the one PayPal JS SDK script load
      // above — independent of each other, so run together instead of sequentially. Both fatal on failure.
      // No request body at all: payment is based on cart in session.
      // If ever changed - processor's InitPaymentRequestSchema has to match exactly
      const [paymentResult] = await Promise.all([
        processorRequest<{}, CreatePaymentResponse>(
          sessionHeader(options.sessionId),
          processorUrls(options.processorUrl).createPaymentUrl,
          {}
        ),
        preloadPayPalScript(paypalScriptOptions),
      ]);
      if (!paymentResult) {
        throw new Error("Could not create payment");
      }

      return {
        baseOptions: {
          processorUrl: options.processorUrl,
          sessionId: options.sessionId,
          initialPayment: paymentResult,
          storedPaymentMethodsEnabled:
            !!configJson.storedPaymentMethodsConfig?.isEnabled,
          enableVaulting: !!configJson.enableVaulting,
          redirectOnApprove: !!configJson.redirectOnApprove,
          expressSdkOptions: configJson.expressSdkOptions,
          standardScriptOptions: configJson.standardScriptOptions,
          paypalScriptOptions,
          clientId: configJson.clientId,
          environment: configJson.environment,
          settings: configJson.settings,
          userIdToken: configJson.userIdToken,
          onError: options.onError,
          purchaseCallback:
            configJson.purchaseCallback ||
            options.onComplete ||
            ((result: any, options: any) => {
              console.warn(
                "Please configure merchant return url for checkout mode or purchaceCallback for legacy mode",
                result,
                options
              );
            }),
        },
      };
    } catch (err) {
      // Rethrown unchanged; this only adds visibility.
      console.error(`[paypal-enabler][setup] _Setup failed:`, err);
      throw err;
    }
  };

  async createComponentBuilder(
    type: string
  ): Promise<PaymentComponentBuilder | never> {
    const { baseOptions } = await this.setupData;
    return Promise.resolve(
      new PayPalComponentBuilder(toPayPalPaymentMethodType(type), baseOptions)
    );
  }

  async createDropinBuilder(
    type: DropinType
  ): Promise<PaymentDropinBuilder | never> {
    throw new Error(`Drop-in builder is not supported for PayPal`);
  }

  async createExpressBuilder(
    type: string
  ): Promise<PaymentComponentBuilder | never> {
    const { baseOptions } = await this.setupData;
    return Promise.resolve(
      new PayPalComponentBuilder(
        toPayPalPaymentMethodType(type),
        baseOptions,
        "express"
      )
    );
  }

  async createStoredPaymentMethodBuilder(
    type: string
  ): Promise<StoredComponentBuilder | never> {
    const { baseOptions } = await this.setupData;
    const normalizedType = toPayPalPaymentMethodType(type);

    // Only credit cards are vaulted/stored — see Checkout-mode scope.
    if (normalizedType === "CardFields") {
      return new PayPalStoredBuilder(baseOptions);
    }

    throw new Error(`Unsupported stored payment method type: ${type}`);
  }

  async getStoredPaymentMethods({
    allowedMethodTypes,
  }: {
    allowedMethodTypes: string[];
  }): Promise<{ storedPaymentMethods?: StoredPaymentMethod[] }> {
    const { baseOptions } = await this.setupData;
    const url = processorUrls(
      baseOptions.processorUrl
    ).getStoredPaymentMethodsURL;
    const response = await fetch(url, {
      method: "GET",
      headers: sessionHeader(baseOptions.sessionId),
    });
    if (!response.ok) {
      return {};
    }
    const data = await response.json();
    const methods: StoredPaymentMethod[] = (
      data.storedPaymentMethods ?? []
    ).filter((m: StoredPaymentMethod) => allowedMethodTypes.includes(m.type));
    return { storedPaymentMethods: methods };
  }

  async isStoredPaymentMethodsEnabled(): Promise<boolean> {
    const { baseOptions } = await this.setupData;
    return baseOptions.storedPaymentMethodsEnabled ?? false;
  }

  setStorePaymentDetails(enabled: boolean): void {}
}
