import React from "react";

import { CardPaymentSource } from "../../types";
import { brandToLogo } from "../images/brandToLogo";

export type CardProps = Pick<
  CardPaymentSource,
  "brand" | "last_digits" | "expiry" | "name"
>;

export const Card: React.FC<CardProps> = ({
  name,
  brand,
  last_digits,
  expiry,
}) => {
  return (
    <>
      <td className="justify-center flex">{brandToLogo(brand) ?? brand}</td>
      <td>
        {name} ••• {last_digits}
      </td>
      <td>{expiry}</td>
    </>
  );
};
