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
} from "../components/types";

export class PayPalPaymentEnabler implements PaymentEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: BaseOptions) {
    this.setupData = PayPalPaymentEnabler._Setup(options);
  }

  private static _Setup = async (
    options: EnablerOptions
  ): Promise<{ baseOptions: BaseOptions }> => {
    try {
      console.log(
        "[paypal-enabler] processorUrl:",
        options.processorUrl,
        "| sessionId:",
        options.sessionId
      ); //TODO - remove logs after final tests success

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

      // Every standard (non-express) component shares this ONE script config, see BaseOptions.paypalScriptOptions.
      // Deliberately built to be byte-identical to what useSettings.tsx's own <PayPalScriptProvider>
      // merge later produces for a standard component (same intent/dataPartnerAttributionId/
      // merchantId, computed the same way), so the preload below and every component's own later
      // request resolve to the identical script id.
      const paypalScriptOptions: ReactPayPalScriptOptions = {
        clientId: configJson.clientId || "",
        currency: DEFAULT_SCRIPT_CURRENCY,
        ...configJson.standardScriptOptions,
        intent: configJson.settings?.payPalIntent?.toString().toLowerCase(),
        dataPartnerAttributionId: PARTNER_ATTRIBUTION_ID,
        // An unconfigured merchantId resolves to "" from the processor, not undefined, and must
        // be normalized here (see useSettings.tsx's matching comment).
        merchantId: configJson.settings?.merchantId?.length
          ? configJson.settings?.merchantId
          : undefined,
      };

      // One shared commercetools Payment per checkout page load, shared by every builder
      // resolving this same setupData; and the one PayPal JS SDK script load above — independent
      // of each other, so run together instead of sequentially. Both fatal on failure.
      // paymentMethodType/builderType are omitted: at this point no component/builder has been
      // chosen yet — see processor's createPayment() for how it handles that.
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
          standardScriptOptions: configJson.standardScriptOptions || {},
          paypalScriptOptions,
          clientId: configJson.clientId,
          settings: configJson.settings,
          userIdToken: configJson.userIdToken,
          onError: options.onError,
          purchaseCallback:
            configJson.purchaseCallback ||
            options.onComplete ||
            ((result: any, options: any) => {
              console.log("Payment completed", result, options);
            }),
        },
      };
    } catch (error) {
      console.error("[paypal-enabler] setup failed:", error);
      throw error;
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

    // For PayPal, we support card tokens
    if (normalizedType === "CardFields") {
      // Return a builder for stored card payment methods
      // This would be implemented similar to payment component builder
      throw new Error("Stored payment method builder not yet implemented");
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
