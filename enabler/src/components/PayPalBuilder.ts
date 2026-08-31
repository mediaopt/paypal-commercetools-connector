import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../payment-enabler/interfaces/enabler";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import {
  GetSettingsResponse,
  PayPalVariantConfig,
  ValidationHandlers,
} from "../types";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";

// Category 1 — hardcoded, non-overridable: settings a payment method itself requires, not
// something the merchant/processor should be able to configure — e.g. Pay Upon Invoice must
// always use Capture intent. Applied last, unconditionally, per mounted component — whatever the
// processor sends can never change these. Only declare a field here when it's a genuine
// method-inherent constraint, not a preference; everything else is category 2 (see
// ENABLER_DEFAULT_CONFIG below).
const FIXED_SETTINGS_OVERRIDES_BY_COMPONENT: Partial<
  Record<string, Partial<GetSettingsResponse>>
> = {
  // PayUponInvoice: { payPalIntent: "Capture" },
};

// The one true special case — only PayPal's own express builder variant needs config distinct
// from its own componentType entry (see ENABLER_DEFAULT_CONFIG below and mount()'s express-first
// resolution). Not folded into a generic per-component variant map, since no other component is
// ever expected to need a second config slot like this.
const ENABLER_DEFAULT_EXPRESS_CONFIG: Required<PayPalVariantConfig> = {
  style: { buttonColor: "blue", buttonLabel: "buynow", buttonShape: "rect" },
  fundingSources: ["paypal"],
  components: "buttons,card-fields",
};
// Enabler's own built-in default, lowest-priority tier: what renders when the processor sends
// nothing at all for this component. Flat, keyed by componentType — add a row here for a future
// single-variant component (CardFields has no button style/funding sources of its own — only
// `components` applies to it).
const ENABLER_DEFAULT_CONFIG: Partial<Record<string, PayPalVariantConfig>> = {
  PayPal: {
    style: { buttonColor: "blue", buttonLabel: "paypal", buttonShape: "rect" },
    fundingSources: ["paypal", "paylater"],
    components: "buttons,card-fields",
  },
  CardFields: {
    components: "buttons,card-fields",
  },
};

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

    // Only PayPal's own express builder variant ever sets this — see createExpressBuilder in
    // payment-enabler-paypal.ts. Checked first/unconditionally (not per-component) since no other
    // componentType can ever produce it.
    const isExpress = this.builderType === "express";

    // Resolves to the processor-configured slice for this specific component — see
    // BaseOptions.sdkOptions and PAYPAL_SDK_OPTIONS in processor/.env.template.
    const componentSdkOptions = isExpress
      ? this.baseOptions.sdkOptions?.PayPalExpress
      : this.baseOptions.sdkOptions?.[this.componentType];

    // 4-layer resolution (category 2, lowest → highest priority), per mounted component:
    // 1) ENABLER_DEFAULT_EXPRESS_CONFIG/ENABLER_DEFAULT_CONFIG (built-in safety net),
    // 2) "general settings" — the shared, non-variant-specific style the processor resolved from
    // the CT custom object/PAYPAL_SETTINGS (settings.paypalButtonConfig/buttonShape; PayPal only —
    // CardFields has no equivalent), 3) this component's processor override
    // (settings.PayPal/PayPalExpress/CardFields, from PAYPAL_BUTTON_CONFIG),
    // 4) FIXED_SETTINGS_OVERRIDES_BY_COMPONENT (category 1, below). Each layer is a shallow,
    // whole-object replace — "style"/"fundingSources"/"components" are independent of each other,
    // but neither is merged field-by-field with what a lower layer produced (see enabler/README.md
    // for the worked example).
    const variantDefaults = isExpress
      ? ENABLER_DEFAULT_EXPRESS_CONFIG
      : ENABLER_DEFAULT_CONFIG[this.componentType];
    const generalStyle =
      this.baseOptions.settings?.paypalButtonConfig &&
      this.baseOptions.settings?.buttonShape
        ? {
            buttonColor: this.baseOptions.settings.paypalButtonConfig.buttonColor,
            buttonLabel: this.baseOptions.settings.paypalButtonConfig.buttonLabel,
            buttonShape: this.baseOptions.settings.buttonShape,
          }
        : undefined;
    const variantOverride = isExpress
      ? this.baseOptions.settings?.PayPalExpress
      : this.baseOptions.settings?.[this.componentType];

    const resolvedStyle =
      variantOverride?.style ?? generalStyle ?? variantDefaults?.style;
    const fundingSource =
      variantOverride?.fundingSources ?? variantDefaults?.fundingSources;
    // Same concern as PAYPAL_SDK_OPTIONS.<componentType>.components (componentSdkOptions, spread
    // into scriptOptions below) — PAYPAL_SDK_OPTIONS still wins if it also sets `components`,
    // since it's spread after scriptOptions.components here.
    const resolvedComponents =
      variantOverride?.components ?? variantDefaults?.components;

    const scriptOptions: ReactPayPalScriptOptions = {
      clientId: this.baseOptions.clientId || "",
      currency: "EUR",
      components: resolvedComponents,
      enableFunding: "paylater",
      ...componentSdkOptions,
    };

    const fixedOverrides =
      FIXED_SETTINGS_OVERRIDES_BY_COMPONENT[this.componentType] ?? {};
    const initialSettings = {
      ...this.baseOptions.settings,
      ...(resolvedStyle && {
        paypalButtonConfig: {
          buttonColor: resolvedStyle.buttonColor,
          buttonLabel: resolvedStyle.buttonLabel,
        },
        buttonShape: resolvedStyle.buttonShape,
      }),
      ...fixedOverrides,
    };

    const customOptions = {
      options: scriptOptions,
      ...(fundingSource && { fundingSource }),
      requestHeader: {
        "X-Session-Id": this.baseOptions.sessionId,
      },
      shippingMethodId: "standard",
      purchaseCallback: this.baseOptions.purchaseCallback,
      enableVaulting: this.baseOptions.enableVaulting ?? false,
      redirectOnApprove: this.baseOptions.redirectOnApprove,
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
