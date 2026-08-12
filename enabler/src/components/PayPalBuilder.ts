import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../payment-enabler/interfaces/enabler";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import { ValidationHandlers } from "../types";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";

class PayPalComponent implements PaymentComponent {
  private root: Root | null = null;
  private submitHandler:
    | ((storePaymentDetails?: boolean) => Promise<void>)
    | null = null;
  private validationHandlers: ValidationHandlers | null = null;

  constructor(
    private componentType: string,
    private baseOptions: BaseOptions,
    private config: ComponentOptions,
    private builderType?: string
  ) {}

  async mount(selector: string): Promise<void> {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    this.root = createRoot(element);

    // Resolves to the processor-configured slice for this specific component — and, for PayPal,
    // this specific builder variant (standard vs. express) — see BaseOptions.sdkOptions and
    // PAYPAL_SDK_OPTIONS in processor/.env.template.
    const componentSdkOptions =
      this.componentType === "PayPal"
        ? this.baseOptions.sdkOptions?.PayPal?.[
            this.builderType === "express" ? "express" : "standard"
          ]
        : this.componentType === "CardFields"
          ? this.baseOptions.sdkOptions?.CardFields
          : undefined;

    const scriptOptions: ReactPayPalScriptOptions = {
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
      currency: "EUR",
      components: "buttons,card-fields",
      enableFunding: "paylater",
      ...componentSdkOptions,
    };

    // Resolves the button label/color config for this specific builder variant — PayPalStandard/
    // PayPalExpress override the shared paypalButtonConfig fallback (see BaseOptions.settings and
    // enabler/README.md's "PayPal button label/color config" section) — before the settings ever
    // reach SettingsProvider, so consumers (e.g. PayPalMask) don't need to be builderType-aware.
    const variantButtonConfig =
      this.builderType === "express"
        ? this.baseOptions.settings?.PayPalExpress
        : this.baseOptions.settings?.PayPalStandard;
    // Spreading undefined operands is a safe no-op, so this can be built unconditionally; only
    // the emptiness check below needs to know whether there was actually anything to merge — an
    // unconditional `paypalButtonConfig: {}` on settings with no config and no variant override
    // would make PayPalMask.tsx's `if (settings.paypalButtonConfig)` wrongly treat it as "apply
    // this style".
    const mergedButtonConfig = {
      ...this.baseOptions.settings?.paypalButtonConfig,
      ...variantButtonConfig,
    };
    const initialSettings = this.baseOptions.settings && {
      ...this.baseOptions.settings,
      ...(Object.keys(mergedButtonConfig).length
        ? { paypalButtonConfig: mergedButtonConfig }
        : {}),
    };

    const customOptions = {
      options: scriptOptions,
      requestHeader: {
        "X-Session-Id": this.baseOptions.sessionId,
      },
      shippingMethodId: "standard",
      purchaseCallback: this.baseOptions.purchaseCallback,
      enableVaulting: this.baseOptions.enableVaulting ?? false,
      initialSettings,
      initialUserIdToken: this.baseOptions.userIdToken,
      showPayButton: this.config.showPayButton ?? true,
      fullWidth: this.config.fullWidth,
      buttonText: this.config.buttonText,
      onError: this.config.onError,
      initialAmount: this.config.initialAmount,
      onRegisterSubmit: (
        handler: (storePaymentDetails?: boolean) => Promise<void>
      ) => {
        this.submitHandler = handler;
      },
      onRegisterValidation: (handlers: ValidationHandlers) => {
        this.validationHandlers = handlers;
      },
    };

    this.root.render(
      createElement(RenderTemplate, {
        paymentMethodType: this.componentType,
        builderType: this.builderType,
        processorUrl: this.baseOptions.processorUrl,
        customOptions,
      })
    );
  }

  async submit({
    storePaymentDetails,
  }: {
    storePaymentDetails?: boolean;
  }): Promise<void> {
    // The component handles submission internally through purchaseCallback by default;
    // if it registers a submit handler via onRegisterSubmit, delegate to that instead.
    await this.submitHandler?.(storePaymentDetails);
  }

  async showValidation(): Promise<void> {
    await this.validationHandlers?.showValidation();
  }

  async isValid(): Promise<boolean> {
    return (await this.validationHandlers?.isValid()) ?? true;
  }

  async getState() {
    return {};
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * Builder for PayPal payment components
 */
export class PayPalComponentBuilder implements PaymentComponentBuilder {
  componentHasSubmit = true;

  constructor(
    private componentType: string,
    private baseOptions: BaseOptions,
    private builderType?: string
  ) {}

  build(config: ComponentOptions): PaymentComponent {
    return new PayPalComponent(
      this.componentType,
      this.baseOptions,
      config,
      this.builderType
    );
  }
}
