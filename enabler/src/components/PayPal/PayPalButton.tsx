import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { CustomPayPalButtonsComponentProps } from "../../types";

import { PayPalMask } from "./PayPalMask";

export const PayPalButton: FC<CustomPayPalButtonsComponentProps> = (props) => {
  const { paymentInfo, vaultOnly, createsPaymentOnClick } = usePayment();
  return paymentInfo.id || vaultOnly || createsPaymentOnClick ? (
    <PayPalMask {...props} />
  ) : (
    <></>
  );
};
