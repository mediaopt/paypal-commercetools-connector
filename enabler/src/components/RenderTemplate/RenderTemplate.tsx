import { createElement, ComponentType, FC } from "react";
import {
  PayPal,
  CardFields,
  ApplePay,
  GooglePay,
  PayUponInvoice,
  PaymentTokens,
} from "paypal-commercetools-client";
import { RenderPurchase } from "../RenderPurchase/RenderPurchase";

/**
 * Maps PayPal payment method types to their corresponding components from
 * `paypal-commercetools-client` — this is our equivalent of the reference project's
 * `ComponentWithCustomOptions` dispatch switch.
 */
export function getPayPalComponent(type: string): ComponentType<any> {
  switch (type) {
    case "PayPal":
      return PayPal;
    case "CardFields":
      return CardFields;
    case "ApplePay":
      return ApplePay;
    case "GooglePay":
      return GooglePay;
    case "PayUponInvoice":
      return PayUponInvoice;
    case "PaymentTokens":
      return PaymentTokens;
    default:
      throw new Error(`Unsupported payment method type: ${type}`);
  }
}

type RenderTemplateProps = {
  paymentMethodType: string;
  customOptions: Record<string, unknown>;
};

export const RenderTemplate: FC<RenderTemplateProps> = ({
  paymentMethodType,
  customOptions,
}) => {
  const ComponentClass = getPayPalComponent(paymentMethodType);
  return (
    <RenderPurchase>
      {createElement(ComponentClass, customOptions)}
    </RenderPurchase>
  );
};
