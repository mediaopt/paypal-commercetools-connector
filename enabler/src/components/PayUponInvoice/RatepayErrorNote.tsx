import i18n from "i18next";
import { ERROR_TEXT_STYLE, STYLED_LINK } from "../../styles";
import { Trans } from "react-i18next";

export const RatepayErrorNote = (errorKind: string) => {
  const isGerman = i18n.language === "de";
  const references = isGerman
    ? [
        "https://www.ratepay.com/legal-payment-dataprivacy/?lang=de",
        "https://www.ratepay.com/kontakt/",
      ]
    : [
        "https://www.ratepay.com/en/ratepay-data-privacy-statement/",
        "https://www.ratepay.com/en/contact/",
      ];

  return (
    <div className={ERROR_TEXT_STYLE}>
      <Trans
        i18nKey={errorKind}
        components={[
          <a className={STYLED_LINK} href={references[0]} />,
          <a className={STYLED_LINK} href={references[1]} />,
        ]}
      />
    </div>
  );
};
