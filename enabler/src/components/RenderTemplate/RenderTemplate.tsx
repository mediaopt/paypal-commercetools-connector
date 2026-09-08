import { createElement, ComponentType, FC } from "react";
import { createRoot, Root } from "react-dom/client";
import { PayPal } from "../PayPal";
import { CardFields } from "../CardFields";
import { CardFieldsStored } from "../CardFields/CardFieldsStored";
import { ApplePay } from "../ApplePay";
// import {
//   GooglePay,
//   PayUponInvoice,
//   PaymentTokens,
// } from "paypal-commercetools-client";

import { RenderPurchase } from "../RenderPurchase/RenderPurchase";
import {
  ApplePayResolvedOptions,
  BuilderType,
  CardFieldsResolvedOptions,
  CardFieldsStoredResolvedOptions,
  GenericMountProps,
  PayPalBrandResolvedOptions,
  PayPalPaymentMethodType,
} from "../../types";
import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  resolveApplePayOptions,
  resolveCardFieldsOptions,
  resolveCardFieldsStoredOptions,
  resolvePayPalBrandOptions,
} from "./resolveOptions";
import { processorUrls } from "../constants";

/**
 * Maps a payment method type to its concrete component and resolved options —
 * this is our equivalent of the reference project's `ComponentWithCustomOptions` dispatch switch.
 */
export function resolvePayPalComponent(
  paymentMethodType: PayPalPaymentMethodType,
  baseOptions: BaseOptions,
  builderType?: BuilderType
): {
  Component: ComponentType<any>;
  options:
    | PayPalBrandResolvedOptions
    | CardFieldsResolvedOptions
    | CardFieldsStoredResolvedOptions
    | ApplePayResolvedOptions;
} {
  switch (paymentMethodType) {
    case "PayPal":
    case "Sepa":
    case "PayLater":
    case "PayPalCreditCard":
    case "AllButtons":
    case "Venmo":
    case "Credit":
    // Local payment methods (APMs) — active only, see PayPalPaymentMethodType's own comment
    // (types/index.ts) for the not-supported-yet/obsolete groups, commented out of that union
    // entirely so they can't reach this switch.
    case "Ideal":
    case "Bancontact":
    case "Eps":
    case "MyBank":
    case "P24":
    case "Blik":
      return {
        Component: PayPal,
        options: resolvePayPalBrandOptions(
          paymentMethodType,
          baseOptions,
          builderType
        ),
      };
    case "CardFields":
      return {
        Component: CardFields,
        options: resolveCardFieldsOptions(baseOptions),
      };
    case "CardFieldsStored":
      return {
        Component: CardFieldsStored,
        options: resolveCardFieldsStoredOptions(baseOptions),
      };
    case "ApplePay":
      return {
        Component: ApplePay,
        options: resolveApplePayOptions(baseOptions),
      };
    // case "GooglePay":
    //   return { Component: GooglePay, options: ... };
    // case "PayUponInvoice":
    //   return { Component: PayUponInvoice, options: ... };
    // case "PaymentTokens":
    //   return { Component: PaymentTokens, options: ... };
    default:
      throw new Error(`Unsupported payment method type: ${paymentMethodType}`);
  }
}

export type RenderTemplateProps = {
  paymentMethodType: PayPalPaymentMethodType;
  builderType?: BuilderType;
  // Set only by PayPalStoredBuilder-produced mounts (see PayPalStoredBuilder.ts) — true for any
  // component the stored builder builds, since none of them ever render via the PayPal JS SDK
  // client-side (commercetools Checkout owns rendering for stored methods). Consumed by
  // useSettings.tsx to skip <PayPalScriptProvider>.
  skipsPayPalScript?: boolean;
  baseOptions: BaseOptions;
  genericOptions: GenericMountProps;
};

export const RenderTemplate: FC<RenderTemplateProps> = ({
  paymentMethodType,
  builderType,
  skipsPayPalScript,
  baseOptions,
  genericOptions,
}) => {
  const { Component, options } = resolvePayPalComponent(
    paymentMethodType,
    baseOptions,
    builderType
  );
  return (
    <RenderPurchase>
      {createElement(Component, {
        ...genericOptions,
        ...options,
        paymentMethodType,
        builderType,
        skipsPayPalScript,
        // baseOptions.processorUrl is the single source of truth — callers used to also pass a
        // separate processorUrl prop duplicating this same value.
        processorUrl: baseOptions.processorUrl,
        // Injects createPaymentUrl/createOrderUrl/authorizeOrderUrl/onApproveUrl/
        // authenticateThreeDSOrderUrl (plus expressApproveUrl/updateShippingUrl/
        // getStoredPaymentMethodsURL, unused as props but harmless) into the same named slots a
        // self-hosted merchant would otherwise fill in directly — RenderTemplate only ever runs in
        // Checkout mode, so this never runs for self-hosted deployments.
        ...processorUrls(baseOptions.processorUrl),
      })}
    </RenderPurchase>
  );
};

/**
 * Shared by PayPalComponent.mount()/PayPalStoredComponent.mount() — finds the target element,
 * creates a React root, and renders RenderTemplate into it. Both builders otherwise only differ
 * in how they build `props`.
 */
export const mountRenderTemplate = (
  selector: string,
  props: RenderTemplateProps
): Root => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  const root = createRoot(element);
  root.render(createElement(RenderTemplate, props));
  return root;
};
