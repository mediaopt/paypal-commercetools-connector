import {
  PayPalButtons,
  PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { CustomPayPalButtonsComponentProps } from "../../types";
import { useFundingSourceEligible } from "./useFundingSourceEligible";

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
  const isPayLaterEligible = useFundingSourceEligible("paylater");

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
