import { FC } from "react";

import { CardFieldsStoredMask } from "./CardFieldsStoredMask";
import { CardFieldsProps, FormComponentProps } from "../../types";

export type CardFieldsStoredButtonProps = Pick<
  FormComponentProps,
  "onRegisterSubmit"
> &
  Pick<CardFieldsProps, "onError"> & {
    ppVaultTokenId: string;
  };

//gets payment info from builder, is not available in legacy mode
export const CardFieldsStoredButton: FC<CardFieldsStoredButtonProps> = ({
  onRegisterSubmit,
  ppVaultTokenId,
  onError,
}) => (
  <CardFieldsStoredMask
    onRegisterSubmit={onRegisterSubmit}
    ppVaultTokenId={ppVaultTokenId}
    onError={onError}
  />
);
