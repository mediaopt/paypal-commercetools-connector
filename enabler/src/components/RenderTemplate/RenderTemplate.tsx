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
import { BuilderType, PayPalPaymentMethodType } from "../../types";

/**
 * Maps PayPal payment method types to their corresponding components —
 * this is our equivalent of the reference project's `ComponentWithCustomOptions` dispatch switch.
 */
export function getPayPalComponent(
  type: PayPalPaymentMethodType
): ComponentType<any> {
  switch (type) {
    case "PayPal":
    case "Sepa":
    case "PayLater":
    case "PayPalCreditCard":
    case "AllButtons":
    case "Venmo":
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
  paymentMethodType: PayPalPaymentMethodType;
  customOptions: Record<string, unknown>;
  builderType?: BuilderType;
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
      })}
    </RenderPurchase>
  );
};
