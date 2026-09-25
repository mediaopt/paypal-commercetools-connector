import i18n from "i18next";
import { TFunction } from "i18next";
import { SetStringState } from "../types";
import { NotificationType } from "../components/Notifications";

export const handleResponseError = (
  t: TFunction<any, any>,
  notify: (type: NotificationType, text: string) => void,
  errorDetails?: string,
  errorMessage?: string,
  showError?: SetStringState,
) => {
  if (!showError) throw new Error(errorMessage ?? errorDetails);
  else {
    const parsedError = i18n.exists(`invoice.${errorMessage}`)
      ? `invoice.${errorMessage}`
      : undefined;
    if (!parsedError) {
      notify("Error", t("invoice.thirdPartyIssue"));
    } else showError(t(parsedError));
  }
};
