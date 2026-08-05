import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: "en",

  resources: {
    en: {
      translation: {
        interface: {
          birthDate: "Birth date",
          phoneNumber: "Phone number",
          generalError: "Something went wrong. Please try again later.",
        },
        invoice: {
          wrongPhone:
            "Could not identify country code or national phone number, please check the data.",
          thirdPartyIssue:
            "Pay upon invoice is currently not available. Please try again later.",
          merchantIssue: "Pay upon invoice is not available at the moment.",
          tooSmall: "Pay upon invoice is available starting from {{min}} euro.",
          tooBig:
            "Pay upon invoice is available only if amount is below {{max}} euro.",
          invoiceBenefitsMessage:
            "Once you place an order, pay within 30 days. Our partner Ratepay will send you the instructions.",
          legalNote:
            "By clicking on the button, you agree to the <0>terms of payment</0> and <1>performance of a risk check</1> from the payment partner, Ratepay. You also agree to PayPal’s <2>privacy statement</2>. If your request to purchase upon invoice is accepted, the purchase price claim will be assigned to Ratepay, and you may only pay Ratepay, not the merchant.",
          paymentSourceNotVerified:
            "The combination of your name and address could not be validated. Please correct your data and try again. You can find further information in the <0>Ratepay Data Privacy Statement</0> or you can contact Ratepay using this <1>contact form</1>.",
          paymentSourceDeclined:
            "It is not possible to use the selected payment method. This decision is based on automated data processing. You can find further information in the <0>Ratepay Data Privacy Statement</0> or you can contact Ratepay using this <1>contact form</1>.",
          duplicate:
            "A Pay Upon Invoice (Rechnungskauf) order with the same payload has already been successfully processed in the last few seconds. To process a new order, please try again in a few seconds.",
        },
        payPal: {
          paymentSourceNotVerified:
            "Your address could not be validated. Please correct your data and try again.",
          unknownIssue:
            "Something went wrong. Please check your data and try again.",
        },
      },
    },
    de: {
      translation: {
        interface: {
          birthDate: "Geburtsdatum",
          phoneNumber: "Telefonnummer",
          generalError:
            "Etwas ist schief gelaufen. Bitte versuchen Sie es später noch einmal.",
        },
        invoice: {
          wrongPhone:
            "Die Landesvorwahl oder die nationale Telefonnummer konnte nicht identifiziert werden, bitte überprüfen Sie die Daten",
          thirdPartyIssue:
            "Zahlung auf Rechnung ist derzeit nicht verfügbar. Bitte versuchen Sie es später noch einmal.",
          merchantIssue: "Zahlung auf Rechnung ist zur Zeit nicht verfügbar.",
          tooSmall: "Zahlung auf Rechnung ist ab {{min}} Euro möglich.",
          tooBig:
            "Zahlung auf Rechnung ist nur bei einem Betrag unter {{max}} Euro möglich.",
          invoiceBenefitsMessage:
            "Sobald Sie eine Bestellung aufgeben haben, zahlen Sie innerhalb von 30 Tagen. Unser Partner Ratepay wird Ihnen die Anweisungen hierzu schicken.",
          legalNote:
            "Mit Klicken auf den Button akzeptieren Sie die <0>Ratepay Zahlungsbedingungen</0> und erklären sich mit der Durchführung einer <1>Risikoprüfung durch Ratepay</1>, unseren Partner, einverstanden. Sie akzeptieren auch PayPals <2>Datenschutzerklärung</2>. Falls Ihre Transaktion per Kauf auf Rechnung erfolgreich abgewickelt werden kann, wird der Kaufpreis an Ratepay abgetreten und Sie dürfen nur an Ratepay überweisen, nicht an den Händler.",
          paymentSourceNotVerified:
            "Die Kombination aus Ihrem Namen und Ihrer Anschrift konnte nicht validiert werden. Bitte korrigieren Sie Ihre Daten und versuchen Sie es erneut. Weitere Informationen finden Sie in den Ratepay <0>Datenschutzbestimmungen</0> oder nutzen Sie das Ratepay <1>Kontaktformular</1>.",
          paymentSourceDeclined:
            "Die gewählte Zahlungsart kann nicht genutzt werden. Diese Entscheidung basiert auf einem automatisierten Datenverarbeitungsverfahren. Weitere Informationen finden Sie in den Ratepay <0>Datenschutzbestimmungen</0> oder nutzen Sie das Ratepay <1>Kontaktformular</1>.",
          duplicate:
            "Ein Rechnungskauf-Auftrag mit der gleichen Nutzlast wurde in den letzten Sekunden bereits erfolgreich bearbeitet. Um eine neue Bestellung zu verarbeiten, versuchen Sie es bitte in einigen Sekunden erneut.",
        },
        payPal: {
          paymentSourceNotVerified:
            "Ihre Adresse konnte nicht validiert werden. Bitte korrigieren Sie Ihre Daten und versuchen Sie es erneut.",
          unknownIssue:
            "Etwas ist schief gelaufen. Bitte überprüfen Sie Ihre Daten und versuchen Sie es erneut.",
        },
      },
    },
  },
});

export default i18n;
