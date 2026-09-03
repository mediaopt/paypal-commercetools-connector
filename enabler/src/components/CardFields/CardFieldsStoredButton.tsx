import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { CardFieldsStoredMask } from "./CardFieldsStoredMask";
import { FormComponentProps } from "../../types";

export type CardFieldsStoredButtonProps = Pick<
  FormComponentProps,
  "onRegisterSubmit"
> & {
  ppVaultTokenId: string;
};

export const CardFieldsStoredButton: FC<CardFieldsStoredButtonProps> = ({
  onRegisterSubmit,
  ppVaultTokenId,
}) => {
  const { paymentInfo } = usePayment();
  return paymentInfo.id ? (
    <CardFieldsStoredMask
      onRegisterSubmit={onRegisterSubmit}
      ppVaultTokenId={ppVaultTokenId}
    />
  ) : (
    <></>
  );
};
