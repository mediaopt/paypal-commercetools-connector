import { FC, useEffect } from "react";

import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";
import { useNotifications } from "../../app/useNotifications";

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
  const { notify } = useNotifications();

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

  useEffect(() => {
    if (!onRegisterSubmit || !invoiceError) return;
    // Checkout mode, but this cart/settings state is ineligible — PayUponInvoiceMask never mounts
    // below, so nothing would otherwise call onRegisterSubmit/onRegisterValidation. Registering
    // both here overwrites any stale handler PayUponInvoiceMask left behind if the cart became
    // ineligible after it had already mounted.
    const message = t(
      ...(invoiceError as [string, Record<string, number>] | [string])
    );
    const notifyInvoiceError = () => notify("Warning", message);

    // isValid()/showValidation() are the primary path — Checkout is expected to check isValid()
    // before ever calling submit(), and showValidation() is what actually surfaces this message
    // when it does. But a buyer who missed that (e.g. never revisited this step after the cart
    // total dropped below the minimum) can still reach a "Pay" click that goes straight to
    // submit() — PayPalComponent.submit() already throws for a form-like type with nothing
    // registered (see its own comment), but with a generic message; registering a submit handler
    // here instead surfaces the same real reason before rejecting, so the buyer isn't just left
    // with a dead button.
    onRegisterSubmit(async () => {
      notifyInvoiceError();
      throw new Error(message);
    });
    onRegisterValidation?.({
      isValid: async () => false,
      showValidation: async () => notifyInvoiceError(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceError, onRegisterSubmit, onRegisterValidation]);

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
