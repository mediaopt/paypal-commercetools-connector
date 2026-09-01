import { FC } from "react";

import { NotificationsProvider } from "../app/useNotifications";
import { PaymentProvider } from "../app/usePayment";
import { SettingsProvider } from "../app/useSettings";
import { LoaderProvider } from "../app/useLoader";
import { RenderPurchase } from "./RenderPurchase/RenderPurchase";

import { GeneralComponentsProps } from "../types";

export const PayPalContextProvider: FC<
  React.PropsWithChildren<GeneralComponentsProps>
> = ({
  options,
  requestHeader,
  purchaseCallback,

  createPaymentUrl,
  getSettingsUrl,
  getClientTokenUrl,
  createOrderUrl,
  getOrderUrl,
  authorizeOrderUrl,
  getUserInfoUrl,
  removePaymentTokenUrl,
  authenticateThreeDSOrderUrl,

  onApproveUrl,
  onApproveRedirectionUrl,

  createVaultSetupTokenUrl,
  approveVaultSetupTokenUrl,

  shippingMethodId,
  cartInformation,
  enableVaulting,
  paymentMethodType,
  builderType,
  processorUrl,
  initialSettings,
  initialUserIdToken,
  redirectOnApprove,

  children,
}) => {
  return (
    <LoaderProvider>
      <NotificationsProvider>
        <SettingsProvider
          options={options}
          getSettingsUrl={getSettingsUrl}
          requestHeader={requestHeader}
          getUserInfoUrl={getUserInfoUrl}
          removePaymentTokenUrl={removePaymentTokenUrl}
          processorUrl={processorUrl}
          initialSettings={initialSettings}
          initialUserIdToken={initialUserIdToken}
        >
          <PaymentProvider
            options={options}
            createPaymentUrl={createPaymentUrl}
            getClientTokenUrl={getClientTokenUrl}
            getSettingsUrl={getSettingsUrl}
            createOrderUrl={createOrderUrl}
            getOrderUrl={getOrderUrl}
            onApproveUrl={onApproveUrl}
            requestHeader={requestHeader}
            shippingMethodId={shippingMethodId}
            cartInformation={cartInformation}
            purchaseCallback={purchaseCallback}
            authorizeOrderUrl={authorizeOrderUrl}
            enableVaulting={enableVaulting}
            createVaultSetupTokenUrl={createVaultSetupTokenUrl}
            approveVaultSetupTokenUrl={approveVaultSetupTokenUrl}
            onApproveRedirectionUrl={onApproveRedirectionUrl}
            authenticateThreeDSOrderUrl={authenticateThreeDSOrderUrl}
            paymentMethodType={paymentMethodType}
            builderType={builderType}
            processorUrl={processorUrl}
            redirectOnApprove={redirectOnApprove}
          >
            <RenderPurchase>{children}</RenderPurchase>
          </PaymentProvider>
        </SettingsProvider>
      </NotificationsProvider>
    </LoaderProvider>
  );
};
