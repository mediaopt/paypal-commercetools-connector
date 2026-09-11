import { Root } from "react-dom/client";
import {
  StoredComponent,
  StoredComponentBuilder,
  StoredComponentOptions,
} from "../payment-enabler/interfaces/stored";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import { GenericMountProps } from "../types";
import { mountRenderTemplate } from "./RenderTemplate/RenderTemplate";
import { processorRequest } from "../services/processorRequest";
import { storedPaymentMethodUrl } from "./constants";
import { sessionHeader } from "../helpers/sessionHeader";

class PayPalStoredComponent implements StoredComponent {
  private root: Root | null = null;
  private submitHandler:
    | ((storePaymentDetails?: boolean) => Promise<void>)
    | null = null;

  constructor(
    private baseOptions: BaseOptions,
    private config: StoredComponentOptions
  ) {}

  async mount(selector: string): Promise<void> {
    //todo - remove after success server tests
    console.log(`[paypal-enabler] mount CardFieldsStored -> ${selector}`);

    if (this.root) {
      console.warn(
        "[paypal-enabler] CardFieldsStored mount() called again while a previous root was still active — unmounting it before remounting"
      );
      this.root.unmount();
      this.root = null;
    }

    // Method-independent shape, same as PayPalComponent.mount() — the id of the stored
    // PayPal payment token is the one piece of information specific to this mount.
    const genericOptions: GenericMountProps = {
      requestHeader: sessionHeader(this.baseOptions.sessionId),
      initialUserIdToken: this.baseOptions.userIdToken,
      onRegisterSubmit: (
        handler: (storePaymentDetails?: boolean) => Promise<void>
      ) => {
        this.submitHandler = handler;
      },
    };

    this.root = mountRenderTemplate(selector, {
      paymentMethodType: "CardFieldsStored",
      // stored components are rendered via ct checkout interface, not PayPal-based
      isStoredCheckoutComponent: true,
      baseOptions: this.baseOptions,
      genericOptions: { ...genericOptions, ppVaultTokenId: this.config.id },
    });
  }

  async submit(): Promise<void> {
    await this.submitHandler?.();
  }

  async remove(): Promise<void> {
    // processorRequest() swallows request failures and resolves `false` rather than throwing —
    // surface it here instead, matching the braintree reference project's equivalent remove(),
    // which throws on a non-ok response. Checkout only has this promise to tell success from
    // failure; silently resolving on a failed delete would misreport the token as removed.
    const result = await processorRequest(
      sessionHeader(this.baseOptions.sessionId),
      storedPaymentMethodUrl(this.baseOptions.processorUrl, this.config.id),
      undefined,
      "DELETE"
    );
    if (result === false) {
      throw new Error(
        `Failed to delete stored payment method ${this.config.id}`
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    // Shares the standard-component script now (see FIXED_SCRIPT_OPTIONS_BY_PAYMENT_METHOD_TYPE
    // in constants.ts) — so "merchant doesn't accept cards" (which already strips "card-fields"
    // out of the shared components list) also disables stored/vaulted cards, no separate config.
    return (
      this.baseOptions.standardScriptOptions?.components?.includes(
        "card-fields"
      ) ?? true
    );
  }

  unmount(): void {
    console.log("[paypal-enabler] unmount CardFieldsStored");
    if (this.root) {
      this.root.unmount();
      this.root = null;
    } else {
      console.warn(
        "[paypal-enabler] CardFieldsStored unmount() called with no active root"
      );
    }
  }
}

export class PayPalStoredBuilder implements StoredComponentBuilder {
  // Stored components use onRegisterSubmit — the host calls component.submit() to trigger payment.
  public componentHasSubmit = true;

  constructor(private baseOptions: BaseOptions) {}

  build(config: StoredComponentOptions): StoredComponent {
    return new PayPalStoredComponent(this.baseOptions, config);
  }
}
