import { FC } from "react";

import { CardFieldsStoredMask } from "./CardFieldsStoredMask";
import { FormComponentProps } from "../../types";

export type CardFieldsStoredButtonProps = Pick<
  FormComponentProps,
  "onRegisterSubmit"
> & {
  ppVaultTokenId: string;
};

//gets payment info from builder, is not available in legacy mode
export const CardFieldsStoredButton: FC<CardFieldsStoredButtonProps> = ({
  onRegisterSubmit,
  ppVaultTokenId,
}) => (
  <CardFieldsStoredMask
    onRegisterSubmit={onRegisterSubmit}
    ppVaultTokenId={ppVaultTokenId}
  />
);
