import { createApiRoot } from "../client/create.client";
import { AccessTokenObject } from "../types/index.types";
import { logger } from "../utils/logger.utils";

export const getCachedAccessToken = async () => {
  try {
    const apiRoot = createApiRoot();
    return (
      await apiRoot
        .customObjects()
        .withContainerAndKey({
          container: "paypal-commercetools-connector",
          key: "accessToken",
        })
        .get()
        .execute()
    ).body;
  } catch (e) {
    logger.info(`Failed to load cached access token ${(e as Error).message}`);
    return undefined;
  }
};

export const cacheAccessToken = async (
  token: AccessTokenObject,
  version: number
) => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .post({
      body: {
        container: "paypal-commercetools-connector",
        key: "accessToken",
        value: token,
        version: version,
      },
    })
    .execute();
};
