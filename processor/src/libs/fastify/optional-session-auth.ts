import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyRequest } from "fastify";
import { log } from "../logger";
import { errorMessage } from "../../utils/error.utils";

/**
 * Session auth for routes that also answer without a session: commercetools Checkout creates the
 * PayPal Express enabler without one when the merchant's session has no cart yet
 * (https://docs.commercetools.com/checkout/browser-sdk#express-payments).
 * A failure only costs the cart-derived parts of the answer, so it is logged and the request
 * continues. Never logs the session id (it authenticates the buyer's calls) or the raw error.
 */
export const optionalSessionAuth = async (
  hook: SessionHeaderAuthenticationHook,
  request: FastifyRequest
): Promise<void> => {
  if (!request.headers["x-session-id"]) {
    // Intentionally info, not debug: a session canary that helps merchants set up the Express flow properly
    log.info("no session header, answering without a session");
    return;
  }
  try {
    await hook.authenticate()(request);
  } catch (e) {
    const cause = (e as { cause?: unknown })?.cause ?? e;
    const status = (cause as { privateFields?: { status?: unknown } })
      ?.privateFields?.status;
    log.warn(
      `could not read the commercetools session, answering without it — ${errorMessage(
        cause
      )}${status !== undefined ? ` (status ${status})` : ""}`
    );
  }
};
