import { NotificationType } from "./Notifications";
import i18n, { TFunction } from "i18next";

export const errorFunc = (
  err: Record<string, unknown>,
  isLoading: (active: boolean) => void,
  notify: (type: NotificationType, text: string) => void,
  t: TFunction<any, any>,
) => {
  const relevantMessage = i18n.exists(`payPal.${err.message}`)
    ? t(`payPal.${err.message}`)
    : t(`interface.generalError`);
  isLoading(false);
  notify("Error", relevantMessage);
  console.error(err);
};
