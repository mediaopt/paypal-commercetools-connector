import { FC } from "react";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { CardFieldsStoredButton } from "./CardFieldsStoredButton";

import { GeneralComponentsProps, FormComponentProps } from "../../types";

export type CardFieldsStoredProps = Pick<
  GeneralComponentsProps,
  | "requestHeader"
  | "paymentMethodType"
  | "builderType"
  | "processorUrl"
  | "createPaymentUrl"
  | "initialSettings"
  | "initialUserIdToken"
  | "enableVaulting"
  | "skipsPayPalScript"
> &
  Pick<FormComponentProps, "onRegisterSubmit"> & {
    ppVaultTokenId: string;
  };

export const CardFieldsStored: FC<CardFieldsStoredProps> = ({
  requestHeader,
  paymentMethodType,
  builderType,
  processorUrl,
  createPaymentUrl,
  initialSettings,
  initialUserIdToken,
  enableVaulting,
  skipsPayPalScript,
  onRegisterSubmit,
  ppVaultTokenId,
}) => {
  return (
    <PayPalContextProvider
      requestHeader={requestHeader}
      paymentMethodType={paymentMethodType}
      builderType={builderType}
      processorUrl={processorUrl}
      createPaymentUrl={createPaymentUrl}
      initialSettings={initialSettings}
      initialUserIdToken={initialUserIdToken}
      enableVaulting={enableVaulting}
      skipsPayPalScript={skipsPayPalScript}
    >
      <CardFieldsStoredButton
        onRegisterSubmit={onRegisterSubmit}
        ppVaultTokenId={ppVaultTokenId}
      />
    </PayPalContextProvider>
  );
};
