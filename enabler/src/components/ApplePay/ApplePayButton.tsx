import { FC } from "react";
import { PayPalButtonsComponentProps } from "@paypal/react-paypal-js";

import { usePayment } from "../../app/usePayment";

import { ApplePayMask } from "./ApplePayMask";

import { ApplePayProps } from "../../types";

type CustomPayPalButtonsComponentProps = ApplePayProps &
  PayPalButtonsComponentProps & {
    enableVaulting?: boolean;
  };

export const ApplePayButton: FC<CustomPayPalButtonsComponentProps> = (
  props
) => {
  const { paymentInfo } = usePayment();
  return paymentInfo.id ? <ApplePayMask {...props} /> : <></>;
};
