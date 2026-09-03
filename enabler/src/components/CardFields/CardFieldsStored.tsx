import { FC } from "react";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { CardFieldsStoredButton } from "./CardFieldsStoredButton";

import { GeneralComponentsProps, FormComponentProps } from "../../types";

export type CardFieldsStoredProps = Pick<
  GeneralComponentsProps,
  | "options"
  | "requestHeader"
  | "paymentMethodType"
  | "builderType"
  | "processorUrl"
  | "initialSettings"
  | "initialUserIdToken"
  | "enableVaulting"
> &
  Pick<FormComponentProps, "onRegisterSubmit"> & {
    ppVaultTokenId: string;
  };

export const CardFieldsStored: FC<CardFieldsStoredProps> = ({
  options,
  requestHeader,
  paymentMethodType,
  builderType,
  processorUrl,
  initialSettings,
  initialUserIdToken,
  enableVaulting,
  onRegisterSubmit,
  ppVaultTokenId,
}) => {
  return (
    <PayPalContextProvider
      options={options}
      requestHeader={requestHeader}
      paymentMethodType={paymentMethodType}
      builderType={builderType}
      processorUrl={processorUrl}
      initialSettings={initialSettings}
      initialUserIdToken={initialUserIdToken}
      enableVaulting={enableVaulting}
    >
      <CardFieldsStoredButton
        onRegisterSubmit={onRegisterSubmit}
        ppVaultTokenId={ppVaultTokenId}
      />
    </PayPalContextProvider>
  );
};
