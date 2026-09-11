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
import { BaseOptions } from "./interfaces/baseOptions";
import { PayPalComponentBuilder } from "../components/PayPalBuilder";
import { PayPalStoredBuilder } from "../components/PayPalStoredBuilder";
import { processorUrls } from "../components/constants";
import { sessionHeader } from "../helpers/sessionHeader";
import { toPayPalPaymentMethodType } from "../components/paymentMethodTypeMapping";
import { processorRequest } from "../services/processorRequest";
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
    // Traceable per-call id: lets multiple overlapping/repeated _Setup() runs (e.g. Checkout
    // re-triggering setup on a payment-method switch) be told apart in the console instead of
    // their logs interleaving indistinguishably.
    //todo - remove setup call id after live tests
    const setupCallId = Math.random().toString(36).slice(2, 7);

    console.log(
      `[paypal-enabler][setup:${setupCallId}] starting — processorUrl:`,
      options.processorUrl,
      "| sessionId:",
      options.sessionId
    );

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

      console.log(
        `[paypal-enabler][setup:${setupCallId}] config fetched — status:`,
        configResponse.status
      );

      const configJson = await configResponse.json();

      // One commercetools Payment per checkout page load, shared by every standard/stored/express
      // builder resolving this same setupData. Fatal on failure.
      // No request body at all: payment is based on cart in session.
      // If ever changed - processor's InitPaymentRequestSchema has to match exactly
      const paymentResult = await processorRequest<{}, CreatePaymentResponse>(
        sessionHeader(options.sessionId),
        processorUrls(options.processorUrl).createPaymentUrl,
        {}
      );
      if (!paymentResult) {
        throw new Error("Could not create payment");
      }

      console.log(
        `[paypal-enabler][setup:${setupCallId}] payment created/reused — id:`,
        paymentResult.id
      );

      return {
        baseOptions: {
          processorUrl: options.processorUrl,
          sessionId: options.sessionId,
          initialPayment: paymentResult,
          storedPaymentMethodsEnabled:
            !!configJson.storedPaymentMethodsConfig?.isEnabled,
          enableVaulting: !!configJson.enableVaulting,
          redirectOnApprove: !!configJson.redirectOnApprove,
          sdkOptions: configJson.sdkOptions,
          standardScriptOptions: configJson.standardScriptOptions,
          clientId: configJson.clientId,
          settings: configJson.settings,
          userIdToken: configJson.userIdToken,
          purchaseCallback:
            configJson.purchaseCallback ||
            options.onComplete ||
            ((result: any, options: any) => {
              console.log("Payment completed", result, options);
            }),
        },
      };
    } catch (err) {
      // Rethrown unchanged; this only adds visibility.
      console.error(
        `[paypal-enabler][setup:${setupCallId}] _Setup failed:`,
        err
      );
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
