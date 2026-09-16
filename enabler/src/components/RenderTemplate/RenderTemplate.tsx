import { createElement, ComponentType, FC } from "react";
import { PayPal } from "../PayPal";
import { CardFields } from "../CardFields";
// import {
//   ApplePay,
//   GooglePay,
//   PayUponInvoice,
//   PaymentTokens,
// } from "paypal-commercetools-client";

import { RenderPurchase } from "../RenderPurchase/RenderPurchase";
import { processorUrls } from "../constants";

/**
 * Maps PayPal payment method types to their corresponding components —
 * this is our equivalent of the reference project's `ComponentWithCustomOptions` dispatch switch.
 */
export function getPayPalComponent(type: string): ComponentType<any> {
  switch (type) {
    case "PayPal":
      return PayPal;
    case "CardFields":
      return CardFields;
    // case "ApplePay":
    //   return ApplePay;
    // case "GooglePay":
    //   return GooglePay;
    // case "PayUponInvoice":
    //   return PayUponInvoice;
    // case "PaymentTokens":
    //   return PaymentTokens;
    default:
      throw new Error(`Unsupported payment method type: ${type}`);
  }
}

type RenderTemplateProps = {
  paymentMethodType: string;
  customOptions: Record<string, unknown>;
  builderType?: string;
  processorUrl?: string;
};

export const RenderTemplate: FC<RenderTemplateProps> = ({
  paymentMethodType,
  customOptions,
  builderType,
  processorUrl,
}) => {
  const ComponentClass = getPayPalComponent(paymentMethodType);
  return (
    <RenderPurchase>
      {createElement(ComponentClass, {
        ...customOptions,
        paymentMethodType,
        builderType,
        processorUrl,
        // Injects createPaymentUrl/createOrderUrl/authorizeOrderUrl/onApproveUrl/
        // authenticateThreeDSOrderUrl (plus expressApproveUrl/updateShippingUrl/
        // getStoredPaymentMethodsURL, unused as props but harmless) into the same named slots a
        // self-hosted merchant would otherwise fill in directly — RenderTemplate only ever runs in
        // Checkout mode, so this never runs for self-hosted deployments.
        ...(processorUrl ? processorUrls(processorUrl) : {}),
      })}
    </RenderPurchase>
  );
};
