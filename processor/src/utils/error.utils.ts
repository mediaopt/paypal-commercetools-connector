import { log } from "../libs/logger";

const CT_SYNC_MAX_ATTEMPTS = 6;
const CT_SYNC_BACKOFF_BASE_MS = 500; // up to ~3s total across CT_SYNC_MAX_ATTEMPTS retries

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : JSON.stringify(err);

// extracts the details of PayPal error response not available directly
export const errorResponseBody = (err: unknown): unknown =>
  (err as { response?: { data?: unknown } })?.response?.data;

// True when a PayPal order-PATCH call (`updatePayPalOrder`) was rejected specifically because
// the chosen JSON-Patch op ("add" vs "replace") didn't match the order's actual current state —
// PayPal's error code for exactly that mismatch. Used to trigger a retry with the corrected op
// (the only other possible value) rather than treating it as a hard failure.
export const isPayPalInvalidPatchOperationError = (err: unknown): boolean => {
  const body = errorResponseBody(err) as
    | { details?: Array<{ issue?: string }> }
    | undefined;
  return !!body?.details?.some((d) => d.issue === "INVALID_PATCH_OPERATION");
};

// CT SDK (connect-payments-sdk) uses `httpErrorStatus`; raw CT API client uses `statusCode`.
export const getCtErrorKind = (
  err: unknown
): "auth" | "not-found" | "other" => {
  const status =
    (err as { httpErrorStatus?: number })?.httpErrorStatus ??
    (err as { statusCode?: number })?.statusCode;
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not-found";
  return "other";
};

export async function retryCTSync(
  fn: () => Promise<void>,
  methodName: string,
  paymentId: string,
  logOnError: string,
  maxAttempts = CT_SYNC_MAX_ATTEMPTS
): Promise<void> {
  const stateSuffix = logOnError ? ` [PayPal: ${logOnError}]` : "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fn();
      if (attempt > 1)
        log.info(
          `${methodName}: CT sync succeeded on retry ${attempt}, paymentId: ${paymentId}`
        );
      return;
    } catch (err) {
      log.error(
        `${methodName}: CT sync failed (attempt ${attempt}/${maxAttempts}), paymentId: ${paymentId} — ${errorMessage(
          err
        )}`
      );
      const errorKind = getCtErrorKind(err);
      if (errorKind === "auth") {
        log.warn(
          `${methodName}: CT sync skipping retry (auth error), paymentId: ${paymentId}${stateSuffix}`
        );
        return;
      }
      if (errorKind === "not-found") {
        log.error(
          `${methodName}: CT payment not found after PayPal operation completed (404), paymentId: ${paymentId} — CT state is permanently inconsistent${stateSuffix}`
        );
        return;
      }
      if (attempt < maxAttempts)
        await new Promise((resolve) =>
          setTimeout(resolve, CT_SYNC_BACKOFF_BASE_MS * 2 ** (attempt - 1))
        );
    }
  }
  log.error(
    `${methodName}: CT sync exhausted all ${maxAttempts} attempts, paymentId: ${paymentId}${stateSuffix}`
  );
}
