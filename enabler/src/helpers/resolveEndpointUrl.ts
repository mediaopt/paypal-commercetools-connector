import { TFunction } from "i18next";

export const resolveEndpointUrl = (
  processorDerivedUrl: string | undefined,
  legacyUrl: string | undefined,
  fieldName: string,
  t: TFunction<any, any>
): string => {
  const url = processorDerivedUrl ?? legacyUrl;
  if (!url) {
    console.error(
      `[paypal-enabler] Missing configuration for "${fieldName}": neither a processorUrl-derived route nor a legacy ${fieldName} was provided.`
    );
    throw new Error(t("interface.generalError"));
  }
  return url;
};
