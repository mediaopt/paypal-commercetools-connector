import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useNotifications } from "../../app/useNotifications";

import { PayUponInvoiceProps, SmartComponentsProps, FormComponentProps } from "../../types";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { embeddFraudNet } from "./fraudNetIntegration";
import { PayUponInvoiceButton } from "./PayUponInvoiceButton";
import i18n from "../../messages/i18n";

export const PayUponInvoice: FC<SmartComponentsProps & PayUponInvoiceProps & FormComponentProps> = ({
  options,
  createPaymentUrl,
  getSettingsUrl,
  getClientTokenUrl,
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
  initialPayment,
  onRegisterSubmit,
  onRegisterValidation,
  merchantId,
  pageId,
  invoiceBenefitsMessage,
  minPayableAmount,
  maxPayableAmount,
  customLocale,
}) => {
  const [fraudNetSessionId, setFraudNetSessionId] = useState<string>();

  const { notify } = useNotifications();
  const { t } = useTranslation();

  useEffect(() => {
    if (customLocale) {
      const formattedLocale = customLocale.substring(0, 2);
      if (i18n.language !== formattedLocale)
        i18n.changeLanguage(formattedLocale);
    }
  }, [customLocale]);

  useEffect(() => {
    if (!fraudNetSessionId)
      embeddFraudNet(merchantId, pageId, setFraudNetSessionId);
  }, [merchantId, pageId, fraudNetSessionId]);

  useEffect(() => {
    if (fraudNetSessionId === "") notify("Warning", t("thirdPartyIssue"));
  }, [fraudNetSessionId, notify, t]);

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
      initialPayment={initialPayment}
    >
      {fraudNetSessionId ? (
        <PayUponInvoiceButton
          fraudNetSessionId={fraudNetSessionId}
          invoiceBenefitsMessage={invoiceBenefitsMessage}
          maxPayableAmount={maxPayableAmount}
          minPayableAmount={minPayableAmount}
          onRegisterSubmit={onRegisterSubmit}
          onRegisterValidation={onRegisterValidation}
        />
      ) : (
        <></>
      )}
    </PayPalContextProvider>
  );
};
