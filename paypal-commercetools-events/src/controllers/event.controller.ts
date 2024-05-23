import { NextFunction, Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { DeliveryItem, MessagePayload } from '@commercetools/platform-sdk';
import { getOrderById, getPaymentById } from '../service/commercetools.service';
import { ParcelAddedToDeliveryMessagePayload } from '../types/index.types';
import { findSuitableTransactionId } from '../service/payments.service';
import {
  mapCommercetoolsCarrierToPayPalCarrier,
  mapItems,
} from '../utils/map.utils';
import { OrderTrackerRequest } from '../paypal/checkout_api';
import { addDeliveryData } from '../service/paypal.service';
import { getSettings } from '../service/config.service';

function parseRequest(request: Request) {
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }
  const pubSubMessage = request.body.message;
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;
  if (decodedData) {
    logger.info(`Payload received: ${decodedData}`);
    return JSON.parse(decodedData) as MessagePayload;
  }
  throw new CustomError(400, 'Bad request: No payload in the Pub/Sub message');
}

const handleParcelAddedToDelivery = async (
  message: ParcelAddedToDeliveryMessagePayload
) => {
  const settings = await getSettings();
  if (!settings?.sendTrackingToPayPal) {
    return;
  }
  const order = await getOrderById(message.resource.id);
  if (!order) {
    logger.info(`Could not load order with id ${message.resource.id}`);
    return;
  }
  logger.info(`Loaded order with id ${order.id}`);
  if (!order?.paymentInfo?.payments) {
    logger.info(`No payments assigned to order with id ${order.id}`);
    return;
  }
  const parcel = message.parcel;
  logger.info(`Parcel targeted for delivery: ${JSON.stringify(parcel)}`);
  const payment = (
    await Promise.all(
      order.paymentInfo?.payments.map(async ({ id }) => {
        const payment = await getPaymentById(id);
        if (!payment) return undefined;
        const captureTransaction = findSuitableTransactionId(payment, 'Charge');
        return payment?.custom?.fields?.PayPalOrderId && captureTransaction
          ? payment
          : undefined;
      })
    )
  ).find((id) => id);
  logger.info(
    `Payment, related to target parcel ${parcel.id}, ${JSON.stringify(payment)}`
  );
  if (!payment) {
    logger.info(
      `No charged PayPal payment assigned to order with id ${order.id}`
    );
    return;
  }
  const carrier = mapCommercetoolsCarrierToPayPalCarrier(
    parcel?.trackingData?.carrier,
    order.shippingAddress?.country
  );
  const deliveryItems: DeliveryItem[] =
    parcel.items && parcel.items.length
      ? parcel.items
      : order.shippingInfo?.deliveries?.find(
          (delivery) =>
            !!delivery?.parcels?.find(
              (deliveryParcel) => deliveryParcel.id === parcel.id
            )
        )?.items ?? [];
  logger.info(`Items targeted for delivery: ${JSON.stringify(deliveryItems)}`);
  const request = {
    tracking_number: parcel?.trackingData?.trackingId,
    carrier: carrier,
    carrier_name_other:
      carrier === 'OTHER' ? parcel?.trackingData?.carrier : undefined,
    capture_id: findSuitableTransactionId(payment, 'Charge'),
    items: mapItems(order, deliveryItems),
  } as OrderTrackerRequest;
  logger.info(JSON.stringify(request));
  const response = await addDeliveryData(
    payment?.custom?.fields?.PayPalOrderId,
    request
  );
  logger.info(JSON.stringify(response));
  return;
};

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @param {NextFunction} next
 * @returns
 */
export const post = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const message = parseRequest(request);
    switch (message.type) {
      case 'ParcelAddedToDelivery':
        await handleParcelAddedToDelivery(
          message as unknown as ParcelAddedToDeliveryMessagePayload
        );
        response.status(204).send();
        return;
      default:
        response.status(204).send();
        return;
    }
  } catch (error) {
    if (error instanceof Error) {
      next(new CustomError(400, error.message));
    } else {
      next(error);
    }
  }
};
