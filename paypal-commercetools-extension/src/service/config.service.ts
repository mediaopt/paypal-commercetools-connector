import { createApiRoot } from 'common-connect/dist';

export { getSettings } from 'common-connect/dist';

export const deleteAccessToken = async () => {
  const apiRoot = createApiRoot();
  return apiRoot
    .customObjects()
    .withContainerAndKey({
      container: 'paypal-commercetools-connector',
      key: 'accessToken',
    })
    .delete()
    .execute();
};
