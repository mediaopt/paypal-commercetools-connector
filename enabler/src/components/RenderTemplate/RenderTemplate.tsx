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
import {
  BuilderType,
  CardFieldsResolvedOptions,
  GenericMountProps,
  PayPalBrandResolvedOptions,
  PayPalPaymentMethodType,
} from "../../types";
import { BaseOptions } from "../../payment-enabler/interfaces/baseOptions";
import {
  resolveCardFieldsOptions,
  resolvePayPalBrandOptions,
} from "./resolveOptions";

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
  options: PayPalBrandResolvedOptions | CardFieldsResolvedOptions;
} {
  switch (paymentMethodType) {
    case "PayPal":
    case "Sepa":
    case "PayLater":
    case "PayPalCreditCard":
    case "AllButtons":
    case "Venmo":
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
    // case "ApplePay":
    //   return { Component: ApplePay, options: ... };
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

type RenderTemplateProps = {
  paymentMethodType: PayPalPaymentMethodType;
  builderType?: BuilderType;
  processorUrl?: string;
  baseOptions: BaseOptions;
  genericOptions: GenericMountProps;
};

export const RenderTemplate: FC<RenderTemplateProps> = ({
  paymentMethodType,
  builderType,
  processorUrl,
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
        processorUrl,
      })}
    </RenderPurchase>
  );
};
