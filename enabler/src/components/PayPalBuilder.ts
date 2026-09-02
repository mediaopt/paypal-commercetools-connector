import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../payment-enabler/interfaces/enabler";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import {
  BuilderType,
  GenericMountProps,
  PayPalPaymentMethodType,
  ValidationHandlers,
} from "../types";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";
import { isVenmoSupported } from "./venmoAvailability";

class PayPalComponent implements PaymentComponent {
  private root: Root | null = null;
  private submitHandler:
    | ((storePaymentDetails?: boolean) => Promise<void>)
    | null = null;
  private validationHandlers: ValidationHandlers | null = null;

  constructor(
    private paymentMethodType: PayPalPaymentMethodType,
    private baseOptions: BaseOptions,
    private config: ComponentOptions,
    private builderType?: BuilderType
  ) {}

  async mount(selector: string): Promise<void> {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    this.root = createRoot(element);

    // Method-independent — every mounted component gets the same shape here, regardless of
    // paymentMethodType. Method-specific resolution (style/fundingSource/script-options/
    // initialSettings) happens in RenderTemplate/resolveOptions.ts instead, at render time.
    const genericOptions: GenericMountProps = {
      requestHeader: {
        "X-Session-Id": this.baseOptions.sessionId,
      },
      shippingMethodId: "standard",
      purchaseCallback: this.baseOptions.purchaseCallback,
      redirectOnApprove: this.baseOptions.redirectOnApprove,
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
        paymentMethodType: this.paymentMethodType,
        builderType: this.builderType,
        processorUrl: this.baseOptions.processorUrl,
        baseOptions: this.baseOptions,
        genericOptions,
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
    // Only Venmo has a device/browser-capability precondition today — checked directly rather
    // than through a per-payment-method lookup map for just one entry.
    if (this.paymentMethodType === "Venmo") {
      return isVenmoSupported();
    }
    return true;
  }
}

/**
 * Builder for PayPal payment components
 */
export class PayPalComponentBuilder implements PaymentComponentBuilder {
  componentHasSubmit = true;

  constructor(
    private paymentMethodType: PayPalPaymentMethodType,
    private baseOptions: BaseOptions,
    private builderType?: BuilderType
  ) {}

  build(config: ComponentOptions): PaymentComponent {
    return new PayPalComponent(
      this.paymentMethodType,
      this.baseOptions,
      config,
      this.builderType
    );
  }
}
