import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  StoredComponent,
  StoredComponentBuilder,
  StoredComponentOptions,
} from "../payment-enabler/interfaces/stored";
import { BaseOptions } from "../payment-enabler/interfaces/baseOptions";
import { GenericMountProps } from "../types";
import { RenderTemplate } from "./RenderTemplate/RenderTemplate";
import { processorRequest } from "../services/processorRequest";
import { storedPaymentMethodUrl } from "./constants";

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
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    this.root = createRoot(element);

    // Method-independent shape, same as PayPalComponent.mount() — the id of the stored
    // PayPal payment token is the one piece of information specific to this mount.
    const genericOptions: GenericMountProps = {
      requestHeader: {
        "X-Session-Id": this.baseOptions.sessionId,
      },
      initialUserIdToken: this.baseOptions.userIdToken,
      onRegisterSubmit: (
        handler: (storePaymentDetails?: boolean) => Promise<void>
      ) => {
        this.submitHandler = handler;
      },
    };

    this.root.render(
      createElement(RenderTemplate, {
        paymentMethodType: "CardFieldsStored",
        processorUrl: this.baseOptions.processorUrl,
        baseOptions: this.baseOptions,
        genericOptions: { ...genericOptions, ppVaultTokenId: this.config.id },
      })
    );
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
      { "X-Session-Id": this.baseOptions.sessionId },
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
    return true;
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
