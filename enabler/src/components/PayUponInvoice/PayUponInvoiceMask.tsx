import { FC, useState, useEffect } from "react";
import parsePhoneNumber from "libphonenumber-js";
import { usePayment } from "../../app/usePayment";
import { useNotifications } from "../../app/useNotifications";
import { InvoiceLegalNote } from "./InvoiceLegalNote";
import { PayUponInvoiceMaskProps } from "../../types";
import { STYLED_PAYMENT_BUTTON, STYLED_PAYMENT_FIELDS } from "../../styles";
import { useTranslation } from "react-i18next";

import { useLoader } from "../../app/useLoader";
import { RatepayErrorNote } from "./RatepayErrorNote";
import { errorFunc } from "../errorNotification";

const parsePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  // "00" is the common alternative to "+" for the international dialing prefix (e.g. "0049 30
  // 901820" instead of "+49 30 901820") — normalize it away first, otherwise it survives digit
  // stripping and produces a bogus "+00..." number once "+" is prepended below (no country
  // calling code starts with 0).
  const normalizedDigits = digits.startsWith("00") ? digits.slice(2) : digits;
  const formattedPhone = `+${normalizedDigits}`;
  const parsedPhone = parsePhoneNumber(formattedPhone);
  return parsedPhone
    ? `+${parsedPhone?.countryCallingCode ?? ""} ${
        parsedPhone?.nationalNumber ?? ""
      }`
    : formattedPhone;
};

export const PayUponInvoiceMask: FC<PayUponInvoiceMaskProps> = ({
  fraudNetSessionId,
  invoiceBenefitsMessage,
  onRegisterSubmit,
  onRegisterValidation,
}) => {
  const { handleCreateOrder } = usePayment();
  const { notify } = useNotifications();
  const { t } = useTranslation();
  const { isLoading } = useLoader();

  const [phone, setPhone] = useState("+49 ");
  const [birthDate, setBirthDate] = useState<string>();
  let date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  const maxDate = date.toJSON().slice(0, 10);
  const [ratepayMessage, setRatepayMessage] = useState<string>();

  // Single source of truth for form validity — submitForm must gate on this itself, not just
  // trust Checkout to have called isValid()/showValidation() first (it's the last line of
  // defense against sending PayPal a request with birthDate/phone missing).
  const getFormValidity = () => {
    const { countryCallingCode, nationalNumber } = {
      ...parsePhoneNumber(phone),
    };
    return {
      hasBirthDate: !!birthDate,
      hasValidPhone: !!(countryCallingCode && nationalNumber),
      countryCallingCode,
      nationalNumber,
    };
  };

  const getFormError = () => {
    const { hasBirthDate, hasValidPhone } = getFormValidity();
    return !hasBirthDate
      ? t("invoice.missingBirthDate")
      : !hasValidPhone
      ? t("invoice.wrongPhone")
      : undefined;
  };

  const createOrder = () => {
    const { countryCallingCode, nationalNumber } = getFormValidity();
    isLoading(true);
    setRatepayMessage("");
    return handleCreateOrder(
      {
        fraudNetSessionId,
        nationalNumber,
        countryCode: countryCallingCode,
        birthDate,
        setRatepayMessage,
      },
      !!onRegisterSubmit
    );
  };

  const submitForm = async () => {
    const formError = getFormError();
    if (formError) {
      notify("Warning", formError);
      return;
    }
    try {
      await createOrder();
    } catch (err: any) {
      errorFunc(err, isLoading, notify, t);
    }
    isLoading(false);
  };

  useEffect(() => {
    if (!onRegisterSubmit) return;

    // Checkout only has submit()'s promise to tell a failed order apart from a successful one,
    // so every failure must reject here; handleCreateOrder already showed its own notification
    onRegisterSubmit(async () => {
      const formError = getFormError();
      if (formError) {
        notify("Warning", formError);
        throw new Error(formError);
      }
      try {
        await createOrder();
      } finally {
        isLoading(false);
      }
    });
    onRegisterValidation?.({
      isValid: async () => !getFormError(),
      showValidation: async () => {
        const formError = getFormError();
        if (formError) notify("Warning", formError);
      },
    });
    // Must re-register on every phone/birthDate change, not just once on mount — onRegisterSubmit/
    // onRegisterValidation just overwrite Checkout's stored handler each call (last call wins, see
    // PayPalBuilder.ts), so this keeps it pointing at a closure with the current field values
    // instead of freezing on whatever they were when this effect first ran.
  }, [onRegisterSubmit, onRegisterValidation, phone, birthDate]);

  return (
    <form
      aria-label="form"
      className="my-4"
      onSubmit={async (event) => {
        event.preventDefault();
        // In Checkout mode, submission is owned entirely by Checkout's own Pay button via
        // onRegisterSubmit (which runs isValid()/showValidation() first) — the native form must
        // never self-submit, since e.g. pressing Enter in the phone field would otherwise bypass
        // that gating and submit with birthDate still unset.
        if (!onRegisterSubmit) {
          await submitForm();
        }
      }}
    >
      <div className="my-2">
        {invoiceBenefitsMessage ?? t("invoice.invoiceBenefitsMessage")}
      </div>

      <label htmlFor="birthDate">{t("interface.birthDate")}</label>
      <input
        id="birthDate"
        name="birthDate"
        type="date"
        className={STYLED_PAYMENT_FIELDS}
        required
        autoComplete="bday"
        min="1900-01-01"
        max={maxDate}
        onChange={({ target }) => setBirthDate(target.value)}
      />
      <label htmlFor="phone">{t("interface.phoneNumber")}</label>
      <input
        type="tel"
        name="phone"
        id="phone"
        pattern="^\+[0-9]{1,4} [0-9]{0,14}$$"
        placeholder="+49 1231231234"
        maxLength={18}
        value={phone}
        // Reformatting on every keystroke fights the controlled input's own cursor position
        onChange={({ target }) => setPhone(target.value)}
        onBlur={({ target }) => setPhone(parsePhone(target.value))}
        className={STYLED_PAYMENT_FIELDS}
        autoComplete="tel"
        required
      />
      {InvoiceLegalNote}
      {!onRegisterSubmit && (
        <button className={STYLED_PAYMENT_BUTTON} type="submit">
          Pay
        </button>
      )}
      {ratepayMessage && RatepayErrorNote(ratepayMessage)}
    </form>
  );
};
