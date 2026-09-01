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
  BuilderType,
  PayPalMethodConfig,
  PayPalPaymentMethodType,
  ValidationHandlers,
} from "../types";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";
import { isVenmoSupported } from "./venmoAvailability";
import {
  FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE,
  ENABLER_DEFAULT_EXPRESS_CONFIG,
  ENABLER_DEFAULT_CONFIG,
  DEFAULT_SCRIPT_CURRENCY,
  DEFAULT_SCRIPT_ENABLE_FUNDING,
  DEFAULT_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE,
  FIXED_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE,
} from "./constants";

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

    // Vaulting is only genuinely supported end-to-end for CardFields today — commercetools
    // Checkout's own stored-payment-methods feature only ever surfaces card tokens back (see
    // storedPaymentMethod.utils.ts), so vaulting via any other payment method is a dead end right
    // now regardless of merchant config. If a merchant needs vaulting for another payment method,
    // please open an issue.
    const canVault = this.paymentMethodType === "CardFields";

    // Only PayPal's own component with builderType: "express" ever sets this — see
    // createExpressBuilder in payment-enabler-paypal.ts. Checked first/unconditionally (not
    // per-payment-method) since no other paymentMethodType can ever produce it.
    const isExpress = this.builderType === "express";

    // Resolves to the processor-configured slice for this specific payment method — see
    // BaseOptions.sdkOptions and PAYPAL_SDK_OPTIONS in processor/.env.template.
    const componentSdkOptions = isExpress
      ? this.baseOptions.sdkOptions?.PayPalExpress
      : this.baseOptions.sdkOptions?.[this.paymentMethodType];

    // 4-layer resolution (category 2, lowest → highest priority), per mounted payment method:
    // 1) ENABLER_DEFAULT_EXPRESS_CONFIG/ENABLER_DEFAULT_CONFIG (built-in safety net),
    // 2) "general settings" — the shared style, independent of paymentMethodType/builderType, that
    // the processor resolved from the CT custom object/PAYPAL_SETTINGS
    // (settings.paypalButtonConfig/buttonShape; PayPal only — CardFields has no equivalent),
    // 3) this payment method's processor override (settings.PayPal/PayPalExpress/CardFields, from
    // PAYPAL_BUTTON_CONFIG), 4) FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE (category 1,
    // below). Each layer is a shallow, whole-object replace — "style"/"fundingSources"/
    // "components" are independent of each other, but neither is merged field-by-field with what
    // a lower layer produced (see enabler/README.md for the worked example).
    const resolvedDefaults = isExpress
      ? ENABLER_DEFAULT_EXPRESS_CONFIG
      : ENABLER_DEFAULT_CONFIG[this.paymentMethodType];
    const fixedOverrides =
      FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE[this.paymentMethodType] ??
      {};
    const resolvedFixedConfig = fixedOverrides[this.paymentMethodType] as
      | PayPalMethodConfig
      | undefined;
    const generalStyle =
      this.baseOptions.settings?.paypalButtonConfig &&
      this.baseOptions.settings?.buttonShape
        ? {
            buttonColor: this.baseOptions.settings.paypalButtonConfig.buttonColor,
            buttonLabel: this.baseOptions.settings.paypalButtonConfig.buttonLabel,
            buttonShape: this.baseOptions.settings.buttonShape,
          }
        : undefined;
    const resolvedOverride = isExpress
      ? this.baseOptions.settings?.PayPalExpress
      : this.baseOptions.settings?.[this.paymentMethodType];

    const resolvedStyle =
      resolvedOverride?.style ?? generalStyle ?? resolvedDefaults?.style;
    // resolvedFixedConfig wins outright when present (Sepa/PayLater/PayPalCreditCard/Venmo) — see
    // FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE's comment; AllButtons has no entry there, so
    // it falls through to the normal, overridable chain and stays undefined by default.
    const fundingSource =
      resolvedFixedConfig?.fundingSource ??
      resolvedOverride?.fundingSource ??
      resolvedDefaults?.fundingSource;
    // Same concern as PAYPAL_SDK_OPTIONS.<paymentMethodType>.components (componentSdkOptions,
    // spread into scriptOptions below) — PAYPAL_SDK_OPTIONS still wins if it also sets
    // `components`, since it's spread after scriptOptions.components here.
    const resolvedComponents =
      resolvedOverride?.components ?? resolvedDefaults?.components;

    const scriptOptions: ReactPayPalScriptOptions = {
      clientId: this.baseOptions.clientId || "",
      currency: DEFAULT_SCRIPT_CURRENCY,
      components: resolvedComponents,
      enableFunding: DEFAULT_SCRIPT_ENABLE_FUNDING,
      ...DEFAULT_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE[this.paymentMethodType],
      ...componentSdkOptions,
      ...FIXED_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE[this.paymentMethodType],
    };

    const initialSettings = {
      ...this.baseOptions.settings,
      ...(resolvedStyle && {
        paypalButtonConfig: {
          buttonColor: resolvedStyle.buttonColor,
          // Category 1 — hardcoded, non-overridable for builderType: "express" specifically:
          // PayPal Express is the Buy-Now/one-click flow, so its label must always read "buynow"
          // regardless of merchant config. Can't live in
          // FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE (keyed by paymentMethodType, which is
          // "PayPal" for both standard and express) or in ENABLER_DEFAULT_EXPRESS_CONFIG alone
          // (resolvedOverride's style, if set at all, would otherwise replace it wholesale — see
          // the 4-layer resolution comment above).
          buttonLabel: isExpress ? "buynow" : resolvedStyle.buttonLabel,
        },
        buttonShape: resolvedStyle.buttonShape,
      }),
      ...fixedOverrides,
      ...(!canVault && { storeInVaultOnSuccess: false }),
    };

    const customOptions = {
      options: scriptOptions,
      ...(fundingSource && { fundingSource }),
      requestHeader: {
        "X-Session-Id": this.baseOptions.sessionId,
      },
      shippingMethodId: "standard",
      purchaseCallback: this.baseOptions.purchaseCallback,
      enableVaulting: canVault ? this.baseOptions.enableVaulting ?? false : false,
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
        paymentMethodType: this.paymentMethodType,
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
