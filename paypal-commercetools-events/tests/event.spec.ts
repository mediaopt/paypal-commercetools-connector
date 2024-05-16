import { NextFunction, Request, Response } from 'express';
import { describe, expect, test } from '@jest/globals';
let api: any;
const addDeliveryDataCallback = jest.fn();
jest.mock('../src/client/create.client', () => ({
  createApiRoot: jest.fn(() => api),
}));
jest.mock('../src/service/paypal.service', () => ({
  addDeliveryData: addDeliveryDataCallback,
}));
import { post } from '../src/controllers/event.controller';
import { DeliveryItem, LineItem } from '@commercetools/platform-sdk';
import { TrackerItem } from '../src/paypal/checkout_api';

describe('Testing PayPal-commercetools-events Controller', () => {
  function expectSuccessfulResponse(next: NextFunction, response: Response) {
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledTimes(1);
    expect(response.status).toBeCalledWith(204);
    expect(response.send).toBeCalledTimes(1);
    expect(response.send).toBeCalledWith();
  }

  const payPalOrderId = 1234;
  const captureId = 12345;
  const orderId = '123';
  const imageUrl = 'https://example.com/image.jpg';
  const parcelId = 'parcelId';

  const setApiMock = (
    orderLineItems?: Partial<LineItem>[],
    orderDeliveryItems?: DeliveryItem[]
  ) => {
    return {
      customers: jest.fn(() => api),
      payments: jest.fn(() => api),
      orders: jest.fn(() => api),
      customObjects: jest.fn(() => api),
      withContainerAndKey: jest.fn(() => api),
      withId: jest.fn(() => api),
      get: jest.fn(() => api),
      execute: jest
        .fn()
        .mockReturnValueOnce({
          body: {
            value: {
              sendTrackingToPayPal: true,
            },
          },
        })
        .mockReturnValueOnce({
          body: {
            id: orderId,
            shippingAddress: { country: 'DE' },
            paymentInfo: { payments: [{ id: '12' }] },
            lineItems: orderLineItems,
            shippingInfo: {
              deliveries: orderDeliveryItems
                ? [{ parcels: [{ id: parcelId }], items: orderDeliveryItems }]
                : undefined,
            },
          },
        })
        .mockReturnValueOnce({
          body: {
            id: '12',
            custom: { fields: { PayPalOrderId: payPalOrderId } },
            transactions: [{ type: 'Charge', interactionId: captureId }],
          },
        }),
      post: jest.fn(() => api),
    };
  };

  const setValidItems = (
    itemId: string,
    quantity?: number,
    images?: boolean
  ) => {
    const itemsQuantity = quantity ?? 1;
    const validDeliveryItem: DeliveryItem = {
      id: itemId,
      quantity: itemsQuantity,
    };
    const validLineItem: Partial<LineItem> = {
      id: itemId,
      name: { name: itemId },
      variant: {
        id: 1,
        images: images
          ? [
              {
                url: imageUrl,
                dimensions: { w: 1, h: 1 },
              },
            ]
          : undefined,
      },
    };
    const validTrackerItem = {
      name: itemId,
      quantity: `${itemsQuantity}`,
      productCode: undefined,
      image_url: images ? imageUrl : undefined,
    };
    return { validDeliveryItem, validLineItem, validTrackerItem };
  };

  const setMessage = (
    trackingNumber: string,
    deliveryItems?: DeliveryItem[]
  ) => {
    return {
      type: 'ParcelAddedToDelivery',
      notificationType: 'Message',
      id: '1',
      version: 1,
      sequenceNumber: 1,
      resource: {
        id: orderId,
        typeId: 'order',
      },
      resourceVersion: 1,
      delivery: undefined,
      parcel: {
        id: parcelId,
        trackingData: {
          trackingId: trackingNumber,
          carrier: 'DHL',
        },
        items: deliveryItems,
        key: '',
      },
    };
  };

  const trackerData = (
    trackingNumber: string,
    trackerItems?: TrackerItem[]
  ) => {
    return {
      tracking_number: trackingNumber,
      carrier: 'DHL_API',
      carrier_name_other: undefined,
      capture_id: captureId,
      items: trackerItems ?? [],
    };
  };

  test('test parcel added with no items', async () => {
    const trackingNumber = 'noItemsTrackingNumber';
    api = setApiMock([]);
    const message = setMessage(trackingNumber);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    const request = {
      body: {
        message: {
          data: data,
        },
      },
    } as unknown as Request;
    const response = {
      status: jest.fn(() => response),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    await post(request, response, next);
    expectSuccessfulResponse(next, response);
    expect(api.withId).toBeCalledWith({ ID: orderId });
    expect(addDeliveryDataCallback).toBeCalledTimes(1);
    expect(addDeliveryDataCallback).toBeCalledWith(
      payPalOrderId,
      trackerData(trackingNumber)
    );
  });

  test('test parcel added with one item', async () => {
    const trackingNumber = 'oneValidItemTrackingNumber';
    const { validDeliveryItem, validLineItem, validTrackerItem } =
      setValidItems('oneParcelItem');
    api = setApiMock([validLineItem]);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    const request = {
      body: {
        message: {
          data: data,
        },
      },
    } as unknown as Request;
    const response = {
      status: jest.fn(() => response),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    await post(request, response, next);
    expectSuccessfulResponse(next, response);
    expect(api.withId).toBeCalledWith({ ID: orderId });
    expect(addDeliveryDataCallback).toBeCalledTimes(2);
    expect(addDeliveryDataCallback).toBeCalledWith(
      payPalOrderId,
      trackerData(trackingNumber, [validTrackerItem])
    );
  });

  test('test parcel added with wrong item', async () => {
    const trackingNumber = 'wrongItemTrackingNumber';
    const { validLineItem } = setValidItems('orderLineItem');
    const { validDeliveryItem } = setValidItems('parcelDeliveryItem');
    api = setApiMock([validLineItem]);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    const request = {
      body: {
        message: {
          data: data,
        },
      },
    } as unknown as Request;
    const response = {
      status: jest.fn(() => response),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    await post(request, response, next);
    expectSuccessfulResponse(next, response);
    expect(api.withId).toBeCalledWith({ ID: orderId });
    expect(addDeliveryDataCallback).toBeCalledTimes(3);
    expect(addDeliveryDataCallback).toBeCalledWith(
      payPalOrderId,
      trackerData(trackingNumber, [])
    );
  });

  test('test parcel items from order deliveries', async () => {
    const trackingNumber = 'orderDeliveryItemTrackingNumber';
    const { validLineItem, validDeliveryItem, validTrackerItem } =
      setValidItems('orderDeliveryitem');
    api = setApiMock([validLineItem], [validDeliveryItem]);
    const message = setMessage(trackingNumber);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    const request = {
      body: {
        message: {
          data: data,
        },
      },
    } as unknown as Request;
    const response = {
      status: jest.fn(() => response),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    await post(request, response, next);
    expectSuccessfulResponse(next, response);
    expect(api.withId).toBeCalledWith({ ID: orderId });
    expect(addDeliveryDataCallback).toBeCalledTimes(4);
    expect(addDeliveryDataCallback).toBeCalledWith(
      payPalOrderId,
      trackerData(trackingNumber, [validTrackerItem])
    );
  });
});

describe('Testing missing data', () => {
  test.each([
    {
      request: {},
      expectedError: 'Bad request: No Pub/Sub message was received',
    },
    {
      request: { body: {} },
      expectedError: 'Bad request: Wrong No Pub/Sub message format',
    },
    {
      request: { body: { message: {} } },
      expectedError: 'Bad request: No payload in the Pub/Sub message',
    },
  ])('test $expectedError', async ({ request, expectedError }) => {
    const response = {} as unknown as Response;
    const next = jest.fn();
    await post(request as Request, response, next);
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(new Error(expectedError));
  });
});
