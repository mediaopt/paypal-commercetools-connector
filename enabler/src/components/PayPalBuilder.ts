import { Root } from "react-dom/client";
import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../payment-enabler/interfaces/enabler";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import { ExpressOptions } from "../payment-enabler/interfaces/express";
import {
  BuilderType,
  GenericError,
  GenericMountProps,
  PayPalPaymentMethodType,
  ValidationHandlers,
} from "../types";
import { mountRenderTemplate } from "./RenderTemplate/RenderTemplate";
import { isVenmoSupported } from "./venmoAvailability";
import { isApplePaySupported } from "./applePayAvailability";
import { sessionHeader } from "../helpers/sessionHeader";
import { FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE } from "./constants";

// Browser/device-capability preconditions, checked before mounting so commercetools Checkout can
// skip listing an unavailable method entirely.
const AVAILABILITY_CHECKS: Partial<
  Record<PayPalPaymentMethodType, () => boolean>
> = {
  Venmo: isVenmoSupported,
  ApplePay: isApplePaySupported,
};

// SDK "components" (not funding sources) each of these payment methods needs present in the
// shared standardScriptOptions.components list to function at all.
const REQUIRED_SDK_COMPONENT_BY_PAYMENT_METHOD_TYPE: Partial<
  Record<PayPalPaymentMethodType, string>
> = {
  CardFields: "card-fields",
  ApplePay: "applepay",
  GooglePay: "googlepay",
};

// Form-like components that use onRegisterSubmit instead of an internal pay button — Checkout
// calls component.submit() to trigger payment for these types. Every other paymentMethodType
// dispatched through this builder (PayPal, Sepa, PayLater, PayPalCreditCard, AllButtons, Venmo,
// ApplePay) renders its own self-driving button and must NOT have this set, or Checkout will
// expect a submit button/behavior these components never provide. Matches the braintree reference
// project's own BraintreeBuilder.SUBMIT_HAS_CALLBACK allowlist for the same distinction.
const FORM_LIKE_PAYMENT_METHOD_TYPES: PayPalPaymentMethodType[] = [
  "CardFields",
  "PayUponInvoice",
];

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
    if (this.root) {
      console.warn(
        `[paypal-enabler] ${this.paymentMethodType} mount() called again while a previous root was still active — unmounting it before remounting`
      );
      this.root.unmount();
      this.root = null;
    }

    // Method-independent — every mounted component gets the same shape here, regardless of
    // paymentMethodType. Method-specific resolution (style/fundingSource/script-options/
    // initialSettings) happens in RenderTemplate/resolveOptions.ts instead, at render time.
    const genericOptions: GenericMountProps = {
      requestHeader: sessionHeader(this.baseOptions.sessionId),
      purchaseCallback: this.baseOptions.purchaseCallback,
      redirectOnApprove: this.baseOptions.redirectOnApprove,
      initialUserIdToken: this.baseOptions.userIdToken,
      showPayButton: this.config.showPayButton ?? true,
      fullWidth: this.config.fullWidth,
      buttonText: this.config.buttonText,
      // onError is a new, checkout-only prop — not supported for legacy enabler components.
      // For PayPal Express, paymentReference may be stale: onPayButtonClick switches to a new
      // session and Payment, which this mount-time value doesn't follow. Refer to the logs.
      onError: this.baseOptions.onError
        ? (error: GenericError) =>
            this.baseOptions.onError?.(error, {
              paymentReference: this.baseOptions.initialPayment?.id,
            })
        : undefined,
      initialAmount: this.config.initialAmount,
      // For express, Checkout passes ExpressOptions (not ComponentOptions) into build()
      ...(this.builderType === "express" && {
        onExpressPayButtonClick: (this.config as unknown as ExpressOptions)
          .onPayButtonClick,
      }),
      onRegisterSubmit: (
        handler: (storePaymentDetails?: boolean) => Promise<void>
      ) => {
        this.submitHandler = handler;
      },
      onRegisterValidation: (handlers: ValidationHandlers) => {
        this.validationHandlers = handlers;
      },
    };

    this.root = mountRenderTemplate(selector, {
      paymentMethodType: this.paymentMethodType,
      builderType: this.builderType,
      baseOptions: this.baseOptions,
      genericOptions,
    });
  }

  async submit({
    storePaymentDetails,
  }: {
    storePaymentDetails?: boolean;
  }): Promise<void> {
    // The component handles submission internally through purchaseCallback by default;
    // if it registers a submit handler via onRegisterSubmit, delegate to that instead.
    if (!this.submitHandler) {
      if (this.isFormLike()) {
        // A form-like component (CardFields/PayUponInvoice) with nothing registered means its
        // Mask either never mounted (e.g. PayUponInvoice showing an ineligible-cart message
        // instead of its form) or unmounted after a state change — either way there is nothing to
        // submit. Silently resolving here used to leave Checkout waiting forever for a completion
        // signal that would never come (an infinite loader) instead of surfacing an error.
        throw new Error(
          `${this.paymentMethodType} is not ready to submit — no handler registered`
        );
      }
      return;
    }
    await this.submitHandler(storePaymentDetails);
  }

  async showValidation(): Promise<void> {
    await this.validationHandlers?.showValidation();
  }

  async isValid(): Promise<boolean> {
    if (this.validationHandlers) {
      return await this.validationHandlers.isValid();
    }
    // Self-driving buttons (PayPal, ApplePay, etc.) never register validation handlers at all, so
    // "nothing registered" correctly means "always valid" for them. A form-like component with
    // nothing registered means it isn't actually ready/eligible — see submit()'s own comment.
    return !this.isFormLike();
  }

  private isFormLike(): boolean {
    return FORM_LIKE_PAYMENT_METHOD_TYPES.includes(this.paymentMethodType);
  }

  async getState() {
    return {};
  }

  async isAvailable(): Promise<boolean> {
    // Browser/device-capability precondition (Venmo/ApplePay) — checked first, unrelated to the
    // merchant's shared script config.
    const browserCheck = AVAILABILITY_CHECKS[this.paymentMethodType];
    if (browserCheck && !browserCheck()) {
      console.warn(
        `${this.paymentMethodType} not available — browser/device check failed`
      );
      return false;
    }

    // Every individual funding-source button must reflect the merchant's one shared
    // standardScriptOptions.disableFunding — reuses FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE
    // directly (same lookup resolveOptions.ts already uses) rather than a second map, so
    // there's one source of truth for "this type's fixed funding source."
    const fixedFundingSource =
      FIXED_SETTINGS_OVERRIDES_BY_PAYMENT_METHOD_TYPE[this.paymentMethodType]
        ?.fundingSource;
    if (
      fixedFundingSource &&
      this.baseOptions.standardScriptOptions?.disableFunding?.includes(
        fixedFundingSource
      )
    ) {
      console.warn(`${this.paymentMethodType} not available`);
      return false;
    }

    // CardFields/ApplePay are separate SDK components, not funding sources — gated by the shared
    // standardScriptOptions.components list instead.
    const requiredComponent =
      REQUIRED_SDK_COMPONENT_BY_PAYMENT_METHOD_TYPE[this.paymentMethodType];
    if (
      requiredComponent &&
      !this.baseOptions.standardScriptOptions?.components?.includes(
        requiredComponent
      )
    ) {
      console.warn(`${this.paymentMethodType} not available`);
      return false;
    }

    return true;
  }

  unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    } else {
      console.warn(
        `[paypal-enabler] ${this.paymentMethodType} unmount() called with no active root`
      );
    }
  }
}

/**
 * Builder for PayPal payment components
 */
export class PayPalComponentBuilder implements PaymentComponentBuilder {
  componentHasSubmit: boolean;

  constructor(
    private paymentMethodType: PayPalPaymentMethodType,
    private baseOptions: BaseOptions,
    private builderType?: BuilderType
  ) {
    this.componentHasSubmit =
      FORM_LIKE_PAYMENT_METHOD_TYPES.includes(paymentMethodType);
  }

  build(config: ComponentOptions): PaymentComponent {
    return new PayPalComponent(
      this.paymentMethodType,
      this.baseOptions,
      config,
      this.builderType
    );
  }
}
