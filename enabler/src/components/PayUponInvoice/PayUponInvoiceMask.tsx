import { FC, useState } from "react";
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
  const formattedPhone = `+${phone.replace(/\D/g, "")}`;
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
}) => {
  const { handleCreateOrder } = usePayment();
  const { notify } = useNotifications();
  const { t } = useTranslation();
  const { isLoading } = useLoader();

  const [phone, setPhone] = useState("+49 ");
  const [birthDate, setBirthDate] = useState<string>();
  const notifyWrongPhone = () => notify("Warning", t("invoice.wrongPhone"));
  let date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  const maxDate = date.toJSON().slice(0, 10);
  const [ratepayMessage, setRatepayMessage] = useState<string>();

  const submitForm = async () => {
    isLoading(true);
    setRatepayMessage("");
    const { countryCallingCode, nationalNumber } = {
      ...parsePhoneNumber(phone),
    };
    if (countryCallingCode && nationalNumber) {
      try {
        await handleCreateOrder({
          fraudNetSessionId,
          nationalNumber,
          countryCode: countryCallingCode,
          birthDate,
          setRatepayMessage,
        });
      } catch (err: any) {
        errorFunc(err, isLoading, notify, t);
      }
    } else notifyWrongPhone();
    isLoading(false);
  };

  return (
    <form
      aria-label="form"
      className="my-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await submitForm();
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
        onChange={({ target }) => setPhone(parsePhone(target.value))}
        className={STYLED_PAYMENT_FIELDS}
        autoComplete="tel"
        required
      />
      {InvoiceLegalNote}
      <button className={STYLED_PAYMENT_BUTTON} type="submit">
        Pay
      </button>
      {ratepayMessage && RatepayErrorNote(ratepayMessage)}
    </form>
  );
};
