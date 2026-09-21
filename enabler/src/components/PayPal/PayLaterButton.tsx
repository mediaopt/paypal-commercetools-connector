import { useEffect, useState } from "react";
import {
  PayPalButtons,
  PayPalButtonsComponentProps,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { CustomPayPalButtonsComponentProps } from "../../types";

export type PayLaterButtonProps = {
  restprops: Omit<
    CustomPayPalButtonsComponentProps,
    | "enableVaulting"
    | "paypalMessages"
    | "messagesStyle"
    | "disablePayLaterButton"
  >;
  style: PayPalButtonsComponentProps["style"];
  actions: any;
  onError: PayPalButtonsComponentProps["onError"];
};

// Only ever mounted by PayPalMask when payLaterButtonAllowed is already true
// this component only owns PayPal's own SDK eligibility check for "paylater" specifically
export const PayLaterButton: React.FC<PayLaterButtonProps> = ({
  restprops,
  style,
  actions,
  onError,
}) => {
  const [{ isResolved }] = usePayPalScriptReducer();
  const [isPayLaterEligible, setIsPayLaterEligible] = useState(true);

  useEffect(() => {
    if (!isResolved || !window.paypal?.Buttons) {
      return;
    }
    const eligible = window.paypal
      .Buttons({ fundingSource: "paylater" })
      .isEligible();
    setIsPayLaterEligible(eligible);
    if (!eligible) {
      console.warn(
        `[paypal-enabler][paylater] not eligible, skipping the extra PayLater button`
      );
    }
  }, [isResolved]);

  if (!isPayLaterEligible) {
    return null;
  }

  return (
    <PayPalButtons
      {...restprops}
      fundingSource="paylater"
      style={style}
      {...actions}
      onError={onError}
    />
  );
};
