import { FC } from "react";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { CardFieldsButton } from "./CardFieldsButton";

import { FormComponentProps, SmartComponentsProps } from "../../types";

export const CardFields: FC<SmartComponentsProps & FormComponentProps> = ({
  options,

  createPaymentUrl,
  getSettingsUrl,
  createOrderUrl,
  authorizeOrderUrl,
  authenticateThreeDSOrderUrl,
  getUserInfoUrl,

  onApproveUrl,
  onApproveRedirectionUrl,

  createVaultSetupTokenUrl,
  approveVaultSetupTokenUrl,

  requestHeader,
  shippingMethodId,
  cartInformation,
  purchaseCallback,
  enableVaulting,
  paymentMethodType,
  builderType,
  processorUrl,
  initialSettings,
  initialUserIdToken,

  onRegisterSubmit,
  onRegisterValidation,
}) => {
  return (
    <PayPalContextProvider
      options={options}
      requestHeader={requestHeader}
      shippingMethodId={shippingMethodId}
      cartInformation={cartInformation}
      createPaymentUrl={createPaymentUrl}
      createOrderUrl={createOrderUrl}
      onApproveUrl={onApproveUrl}
      getSettingsUrl={getSettingsUrl}
      purchaseCallback={purchaseCallback}
      authorizeOrderUrl={authorizeOrderUrl}
      authenticateThreeDSOrderUrl={authenticateThreeDSOrderUrl}
      getUserInfoUrl={getUserInfoUrl}
      enableVaulting={enableVaulting}
      createVaultSetupTokenUrl={createVaultSetupTokenUrl}
      approveVaultSetupTokenUrl={approveVaultSetupTokenUrl}
      onApproveRedirectionUrl={onApproveRedirectionUrl}
      paymentMethodType={paymentMethodType}
      builderType={builderType}
      processorUrl={processorUrl}
      initialSettings={initialSettings}
      initialUserIdToken={initialUserIdToken}
    >
      <CardFieldsButton
        enableVaulting={enableVaulting}
        onRegisterSubmit={onRegisterSubmit}
        onRegisterValidation={onRegisterValidation}
      />
    </PayPalContextProvider>
  );
};
