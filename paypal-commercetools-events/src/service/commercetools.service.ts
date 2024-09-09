import { Order, Payment, Subscription } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

export const getOrderById = async (
  orderId: string
): Promise<Order | undefined> => {
  if (!orderId) {
    return undefined;
  }
  const apiRoot = createApiRoot();
  const response = await apiRoot
    .orders()
    .withId({ ID: orderId })
    .get()
    .execute();
  return response.body;
};

export const getPaymentById = async (
  paymentId: string
): Promise<Payment | undefined> => {
  if (!paymentId) {
    return undefined;
  }
  const apiRoot = createApiRoot();
  const response = await apiRoot
    .payments()
    .withId({ ID: paymentId })
    .get()
    .execute();
  return response.body;
};

export const findMatchingSubscription = async (
  apiRoot: ByProjectKeyRequestBuilder,
  key: string,
  topic?: string,
  projectId?: string
): Promise<Subscription | undefined> => {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${key}"`,
      },
    })
    .execute();
  if (!topic && !projectId) {
    return subscriptions.length > 0 ? subscriptions[0] : undefined;
  }
  const fittingSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.destination.type === 'GoogleCloudPubSub' &&
      subscription.destination.topic === topic &&
      subscription.destination.projectId === projectId
  );
  return fittingSubscriptions.length > 0 ? fittingSubscriptions[0] : undefined;
};
