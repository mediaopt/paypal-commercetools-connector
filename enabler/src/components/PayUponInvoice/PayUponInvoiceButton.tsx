import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { useHandleCreatePayment } from "../../app/useHandleCreatePayment";
import { useSettings } from "../../app/useSettings";

import { PayUponInvoiceButtonProps } from "../../types";

import { PayUponInvoiceMask } from "./PayUponInvoiceMask";
import { useTranslation } from "react-i18next";

export const PayUponInvoiceButton: FC<PayUponInvoiceButtonProps> = ({
  maxPayableAmount,
  minPayableAmount,
  fraudNetSessionId,
  invoiceBenefitsMessage,
}) => {
  const { paymentInfo, clientToken } = usePayment();
  const { t } = useTranslation();
  useHandleCreatePayment();
  const { settings } = useSettings();

  const invoiceError = !(settings?.payPalIntent === "Capture")
    ? ["invoice.merchantIssue"]
    : paymentInfo.id && paymentInfo.amount < minPayableAmount
    ? ["invoice.tooSmall", { min: minPayableAmount }]
    : paymentInfo.amount > maxPayableAmount
    ? ["invoice.tooBig", { max: maxPayableAmount }]
    : paymentInfo.id && !clientToken
    ? ["invoice.thirdPartyIssue"]
    : null;

  return invoiceError ? (
    <div>{t(...invoiceError)}</div>
  ) : paymentInfo.id && clientToken ? (
    <PayUponInvoiceMask
      fraudNetSessionId={fraudNetSessionId}
      invoiceBenefitsMessage={invoiceBenefitsMessage}
    />
  ) : (
    <></>
  );
};
