import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { findMatchingSubscription } from '../service/commercetools.service';

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
  apiRoot: ByProjectKeyRequestBuilder,
  topicName?: string,
  projectId?: string
): Promise<void> {
  const subscription = await findMatchingSubscription(
    apiRoot,
    PAYPAL_PARCEL_ADDED_TO_DELIVERY_KEY,
    topicName,
    projectId
  );
  if (subscription) {
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
