import { FC } from "react";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { CardFieldsStoredButton } from "./CardFieldsStoredButton";

import {
  GeneralComponentsProps,
  FormComponentProps,
  CardFieldsProps,
} from "../../types";

export type CardFieldsStoredProps = Pick<
  GeneralComponentsProps,
  | "requestHeader"
  | "paymentMethodType"
  | "builderType"
  | "processorUrl"
  | "createPaymentUrl"
  | "createOrderUrl"
  | "initialSettings"
  | "initialUserIdToken"
  | "enableVaulting"
  | "isStoredCheckoutComponent"
  | "initialPayment"
> &
  Pick<FormComponentProps, "onRegisterSubmit"> &
  Pick<CardFieldsProps, "onError"> & {
    ppVaultTokenId: string;
  };

export const CardFieldsStored: FC<CardFieldsStoredProps> = ({
  requestHeader,
  paymentMethodType,
  builderType,
  processorUrl,
  createPaymentUrl,
  createOrderUrl,
  initialSettings,
  initialUserIdToken,
  enableVaulting,
  isStoredCheckoutComponent,
  initialPayment,
  onRegisterSubmit,
  ppVaultTokenId,
  onError,
}) => {
  return (
    <PayPalContextProvider
      requestHeader={requestHeader}
      paymentMethodType={paymentMethodType}
      builderType={builderType}
      processorUrl={processorUrl}
      createPaymentUrl={createPaymentUrl}
      createOrderUrl={createOrderUrl}
      initialSettings={initialSettings}
      initialUserIdToken={initialUserIdToken}
      enableVaulting={enableVaulting}
      isStoredCheckoutComponent={isStoredCheckoutComponent}
      initialPayment={initialPayment}
    >
      <CardFieldsStoredButton
        onRegisterSubmit={onRegisterSubmit}
        ppVaultTokenId={ppVaultTokenId}
        onError={onError}
      />
    </PayPalContextProvider>
  );
};
