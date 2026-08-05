import React from "react";
import { PayPalButtonsComponentProps } from "@paypal/react-paypal-js";

import { usePayment } from "../../app/usePayment";
import { useHandleCreatePayment } from "../../app/useHandleCreatePayment";

import { PayPalMask } from "./PayPalMask";

type CustomPayPalButtonsComponentProps = PayPalButtonsComponentProps & {
  enableVaulting?: boolean;
};

export const PayPalButton: React.FC<CustomPayPalButtonsComponentProps> = (
  props
) => {
  const { paymentInfo, vaultOnly } = usePayment();
  useHandleCreatePayment();
  return paymentInfo.id || vaultOnly ? <PayPalMask {...props} /> : <></>;
};
