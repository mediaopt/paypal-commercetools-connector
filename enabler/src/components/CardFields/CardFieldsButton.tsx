import React from "react";

import { usePayment } from "../../app/usePayment";
import { CardFieldsMask } from "./CardFieldsMask";
import { CardFieldsProps } from "../../types";

export const CardFieldsButton: React.FC<CardFieldsProps> = ({
  enableVaulting,
  onRegisterSubmit,
  onRegisterValidation,
}) => {
  const { paymentInfo, vaultOnly } = usePayment();
  return paymentInfo.id || vaultOnly ? (
    <CardFieldsMask
      enableVaulting={enableVaulting}
      onRegisterSubmit={onRegisterSubmit}
      onRegisterValidation={onRegisterValidation}
    />
  ) : (
    <></>
  );
};
