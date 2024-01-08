import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const PAYPAL_PARCEL_ADDED_TO_DELIVERY_KEY = 'paypal-parcelAddedToDelivery';

export async function createParcelAddedToDeliverySubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
): Promise<void> {
  await deleteParcelAddedToDeliverySubscription(apiRoot);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: PAYPAL_PARCEL_ADDED_TO_DELIVERY_KEY,
        destination: {
          type: 'GoogleCloudPubSub',
          topic: topicName,
          projectId,
        },
        messages: [
          {
            resourceTypeId: 'order',
            types: ['ParcelAddedToDelivery'],
          },
        ],
      },
    })
    .execute();
}

export async function deleteParcelAddedToDeliverySubscription(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${PAYPAL_PARCEL_ADDED_TO_DELIVERY_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: PAYPAL_PARCEL_ADDED_TO_DELIVERY_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
