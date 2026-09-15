import { createApiRoot } from "../client/create.client";
import { PAYPAL_PAYMENT_EXTENSION_KEY } from "../constants";
import { CustomError } from "../errors/custom.error";

export const getPayPalExtensionUrl = async () => {
  const apiRoot = createApiRoot();
  const extensions = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${PAYPAL_PAYMENT_EXTENSION_KEY}"`,
      },
    })
    .execute();
  if (extensions.body.total !== 1)
    throw new CustomError(
      500,
      `Matching PayPal extension for the key ${PAYPAL_PAYMENT_EXTENSION_KEY} not found.`
    );
  else {
    const destination = extensions.body.results[0].destination;
    if ("url" in destination) return destination.url;
    else
      throw new CustomError(
        500,
        `Extension ${PAYPAL_PAYMENT_EXTENSION_KEY} is of ${destination.type} instead of expected HTTP type`
      );
  }
};
