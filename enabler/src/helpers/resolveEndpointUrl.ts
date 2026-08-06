export const resolveEndpointUrl = (
  processorDerivedUrl: string | undefined,
  legacyUrl: string | undefined,
  fieldName: string
): string => {
  const url = processorDerivedUrl ?? legacyUrl;
  if (!url) {
    console.error(
      `[paypal-enabler] Missing configuration for "${fieldName}": neither a processorUrl-derived route nor a legacy ${fieldName} was provided.`
    );
    throw new Error("Something went wrong");
  }
  return url;
};
