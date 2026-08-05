import React from "react";

import { PayPalPaymentSource } from "../../types";
import { brandToLogo } from "../images/brandToLogo";

export type PayPalProps = Pick<PayPalPaymentSource, "email_address">;

export const PayPal: React.FC<PayPalProps> = ({ email_address }) => {
  return (
    <>
      <td className="justify-center flex">{brandToLogo("payPal")}</td>
      <td>{email_address}</td>
      <td>N/A</td>
    </>
  );
};
