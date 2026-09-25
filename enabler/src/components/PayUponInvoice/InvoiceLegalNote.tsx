import { Trans } from "react-i18next";
import { STYLED_LINK } from "../../styles";

export const InvoiceLegalNote = (
  <div className="w-full text-sm te">
    <Trans
      i18nKey="invoice.legalNote"
      components={[
        <a
          className={STYLED_LINK}
          href="https://www.ratepay.com/legal-payment-terms"
        />,
        <a
          className={STYLED_LINK}
          href="https://www.ratepay.com/legal-payment-dataprivacy"
        />,
        <a
          className={STYLED_LINK}
          href="https://www.paypal.com/us/webapps/mpp/ua/privacy-full"
        />,
      ]}
    />
  </div>
);
