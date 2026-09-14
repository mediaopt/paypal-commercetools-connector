import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";

import { PayUponInvoiceButtonProps } from "../../types";

import { PayUponInvoiceMask } from "./PayUponInvoiceMask";
import { useTranslation } from "react-i18next";

export const PayUponInvoiceButton: FC<PayUponInvoiceButtonProps> = ({
  maxPayableAmount,
  minPayableAmount,
  fraudNetSessionId,
  invoiceBenefitsMessage,
  onRegisterSubmit,
  onRegisterValidation,
}) => {
  const { paymentInfo, clientToken } = usePayment();
  const { t } = useTranslation();
  const { settings } = useSettings();

  // minPayableAmount/maxPayableAmount are in cents (to compare directly against
  // paymentInfo.amountPlanned.centAmount).
  //
  // clientToken is a Braintree-era concept (getClientTokenUrl/braintreeCustomerId in
  // usePayment.tsx) — in Checkout mode (onRegisterSubmit set) that fetch is skipped whenever
  // initialPayment is already seeded, which it always is there (see usePayment.tsx's own
  // comment), so clientToken never populates and must not gate rendering. In legacy/self-hosted
  // mode (no onRegisterSubmit) that fetch does run, so it's still a real, required check there.
  const invoiceError = !(settings?.payPalIntent === "Capture")
    ? ["invoice.merchantIssue"]
    : paymentInfo.id && paymentInfo.amountPlanned.centAmount < minPayableAmount
    ? ["invoice.tooSmall", { min: minPayableAmount / 100 }]
    : paymentInfo.amountPlanned.centAmount > maxPayableAmount
    ? ["invoice.tooBig", { max: maxPayableAmount / 100 }]
    : paymentInfo.id && !onRegisterSubmit && !clientToken
    ? ["invoice.thirdPartyIssue"]
    : null;

  return invoiceError ? (
    <div>
      {t(...(invoiceError as [string, Record<string, number>] | [string]))}
    </div>
  ) : paymentInfo.id && (onRegisterSubmit || clientToken) ? (
    <PayUponInvoiceMask
      fraudNetSessionId={fraudNetSessionId}
      invoiceBenefitsMessage={invoiceBenefitsMessage}
      onRegisterSubmit={onRegisterSubmit}
      onRegisterValidation={onRegisterValidation}
    />
  ) : (
    <></>
  );
};
