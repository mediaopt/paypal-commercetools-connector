import { FC } from "react";
import { PayPalButtonsComponentProps } from "@paypal/react-paypal-js";

import { usePayment } from "../../app/usePayment";

import { GooglePayMask } from "./GooglePayMask";

import { GooglePayOptionsType } from "../../types";

type CustomPayPalButtonsComponentProps = GooglePayOptionsType &
  PayPalButtonsComponentProps & {
    enableVaulting?: boolean;
  };

export const GooglePayButton: FC<CustomPayPalButtonsComponentProps> = (
  props
) => {
  const { paymentInfo } = usePayment();
  return paymentInfo.id ? <GooglePayMask {...props} /> : <></>;
};
