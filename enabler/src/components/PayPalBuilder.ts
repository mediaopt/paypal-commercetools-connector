import { Root } from "react-dom/client";
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
import { mountRenderTemplate } from "./RenderTemplate/RenderTemplate";
import { isVenmoSupported } from "./venmoAvailability";
import { isApplePaySupported } from "./applePayAvailability";
import { sessionHeader } from "../helpers/sessionHeader";

// Browser/device-capability preconditions, checked before mounting so commercetools Checkout can
// skip listing an unavailable method entirely.
const AVAILABILITY_CHECKS: Partial<
  Record<PayPalPaymentMethodType, () => boolean>
> = {
  Venmo: isVenmoSupported,
  ApplePay: isApplePaySupported,
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
    return AVAILABILITY_CHECKS[this.paymentMethodType]?.() ?? true;
  }

  unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
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
