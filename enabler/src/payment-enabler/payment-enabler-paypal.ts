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
import { processorUrls } from "../components/constants";
import { sessionHeader } from "../helpers/sessionHeader";

export type PayPalPaymentMethodType =
  | "PayPal"
  | "CardFields"
  | "ApplePay"
  | "GooglePay"
  | "PayUponInvoice"
  | "PaymentTokens";

export type PayPalPaymentMethodExpressType = Extract<
  PayPalPaymentMethodType,
  "PayPal"
>;

export class PayPalPaymentEnabler implements PaymentEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: BaseOptions) {
    this.setupData = PayPalPaymentEnabler._Setup(options);
  }

  private static _Setup = async (
    options: EnablerOptions
  ): Promise<{ baseOptions: BaseOptions }> => {
    console.log(
      "[paypal-enabler] processorUrl:",
      options.processorUrl,
      "| sessionId:",
      options.sessionId
    );

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

    return Promise.resolve({
      baseOptions: {
        processorUrl: options.processorUrl,
        sessionId: options.sessionId,
        storedPaymentMethodsEnabled:
          !!configJson.storedPaymentMethodsConfig?.isEnabled,
        enableVaulting: !!configJson.enableVaulting,
        sdkOptions: configJson.sdkOptions,
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
    });
  };

  async createComponentBuilder(
    type: string
  ): Promise<PaymentComponentBuilder | never> {
    const { baseOptions } = await this.setupData;
    return Promise.resolve(new PayPalComponentBuilder(type, baseOptions));
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
      new PayPalComponentBuilder(type, baseOptions, "express")
    );
  }

  async createStoredPaymentMethodBuilder(
    type: string
  ): Promise<StoredComponentBuilder | never> {
    const { baseOptions } = await this.setupData;

    // For PayPal, we support card tokens
    if (type === "card") {
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
    const url = processorUrls(baseOptions.processorUrl)
      .getStoredPaymentMethodsURL;
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
