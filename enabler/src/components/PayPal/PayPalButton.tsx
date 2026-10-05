import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { CustomPayPalButtonsComponentProps } from "../../types";

import { PayPalMask } from "./PayPalMask";

export const PayPalButton: FC<CustomPayPalButtonsComponentProps> = (props) => {
  const { paymentInfo, vaultOnly, builderType } = usePayment();
  // PayPal Express has no Payment before the click — handleCreateOrder creates it
  return paymentInfo.id || vaultOnly || builderType === "express" ? (
    <PayPalMask {...props} />
  ) : (
    <></>
  );
};
