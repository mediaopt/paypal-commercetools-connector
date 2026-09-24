import { useEffect, useMemo } from "react";
import {
  PayPalMessages,
  PayPalMessagesComponentProps,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { CustomPayPalButtonsComponentProps, PaymentInfo } from "../../types";
import { PAY_LATER_MESSAGES_SUPPORTED_COUNTRIES } from "./messagesConstants";

export type PayPalMessagesWidgetProps = {
  paypalMessages: PayPalMessagesComponentProps | undefined;
  fundingSource: CustomPayPalButtonsComponentProps["fundingSource"];
  paymentInfo: PaymentInfo;
  isExpress: boolean;
  messagesStyle: PayPalMessagesComponentProps["style"] | undefined;
};

// In legacy mode it is merchant responsibility to provide messages content,
// in checkout they are calculated based on cart
// if cart currency and PayPal merchant account currency don't match -
// messages will not be shown by PayPal automatically, but the PayPal error could show different reason
export const PayPalMessagesWidget: React.FC<PayPalMessagesWidgetProps> = ({
  paypalMessages,
  fundingSource,
  paymentInfo,
  isExpress,
  messagesStyle,
}) => {
  const [{ isResolved }] = usePayPalScriptReducer();
  // Messages is not part of the default script components list, so window.paypal.Messages
  // may be missing even after the script resolves - guard rather than crash on render.
  const isMessagesEligible = isResolved && !!window.paypal?.Messages;

  useEffect(() => {
    if (isResolved && !window.paypal?.Messages) {
      console.warn(
        `[paypal-enabler][messages] script resolved but window.paypal.Messages is missing — the message will not render`
      );
    }
  }, [isResolved]);

  const resolved = useMemo<PayPalMessagesComponentProps | undefined>(() => {
    if (paypalMessages) {
      return paypalMessages;
    }
    if (
      fundingSource !== "paypal" ||
      !paymentInfo.countryCode ||
      !PAY_LATER_MESSAGES_SUPPORTED_COUNTRIES.has(paymentInfo.countryCode)
    ) {
      return undefined;
    }
    const { centAmount, currencyCode, fractionDigits } =
      paymentInfo.amountPlanned;
    return {
      ...(messagesStyle && { style: messagesStyle }),
      amount: (centAmount / 10 ** fractionDigits).toFixed(fractionDigits),
      currency: currencyCode as PayPalMessagesComponentProps["currency"],
      placement: isExpress ? "product" : "payment",
    };
  }, [paypalMessages, fundingSource, paymentInfo, isExpress, messagesStyle]);

  if (!resolved || !isMessagesEligible) {
    return null;
  }

  return <PayPalMessages {...resolved} />;
};
