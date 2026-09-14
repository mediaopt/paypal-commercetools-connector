import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useNotifications } from "../../app/useNotifications";

import { PayUponInvoiceProps, SmartComponentsProps } from "../../types";

import { RenderTemplate } from "../RenderTemplate";
import { embeddFraudNet } from "./fraudNetIntegration";
import { PayUponInvoiceButton } from "./PayUponInvoiceButton";
import i18n from "../../messages/i18n";

export const PayUponInvoice: FC<SmartComponentsProps & PayUponInvoiceProps> = ({
  options,
  createPaymentUrl,
  getSettingsUrl,
  getClientTokenUrl,
  createOrderUrl,
  onApproveUrl,
  requestHeader,
  shippingMethodId,
  cartInformation,
  purchaseCallback,
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
    <RenderTemplate
      options={options}
      createPaymentUrl={createPaymentUrl}
      getSettingsUrl={getSettingsUrl}
      createOrderUrl={createOrderUrl}
      getClientTokenUrl={getClientTokenUrl}
      onApproveUrl={onApproveUrl}
      requestHeader={requestHeader}
      shippingMethodId={shippingMethodId}
      cartInformation={cartInformation}
      purchaseCallback={purchaseCallback}
    >
      {fraudNetSessionId ? (
        <PayUponInvoiceButton
          fraudNetSessionId={fraudNetSessionId}
          invoiceBenefitsMessage={invoiceBenefitsMessage}
          maxPayableAmount={maxPayableAmount}
          minPayableAmount={minPayableAmount}
        />
      ) : (
        <></>
      )}
    </RenderTemplate>
  );
};
