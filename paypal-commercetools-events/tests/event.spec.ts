import { Request, Response } from 'express';
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
  const payPalOrderId = 1234;
  const captureId = 12345;
  const orderId = '123';
  const imageUrl = 'https://example.com/image.jpg';
  const parcelId = 'parcelId';
  const itemsQuantity = [1, 2, 3, 4];

  const setApiMock = (
    orderLineItems?: Partial<LineItem>[],
    orderDeliveryItems?: DeliveryItem[],
    sendTrackingToPayPal = true
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
              sendTrackingToPayPal,
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
  const expectTrackingResponse = async (data: string) => {
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
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledTimes(1);
    expect(response.status).toBeCalledWith(204);
    expect(response.send).toBeCalledTimes(1);
    expect(response.send).toBeCalledWith();
  };

  const expectSuccessFullTracking = async (
    data: string,
    trackingNumber: string,
    calledTimes: number,
    trackerItems?: TrackerItem[]
  ) => {
    await expectTrackingResponse(data);
    expect(api.withId).toBeCalledWith({ ID: orderId });
    expect(addDeliveryDataCallback).toBeCalledTimes(calledTimes);
    expect(addDeliveryDataCallback).toBeCalledWith(
      payPalOrderId,
      trackerData(trackingNumber, trackerItems)
    );
  };

  test('test parcel added with disabled set tracking', async () => {
    const trackingNumber = 'noTrackingTrackingNumber';
    const { validDeliveryItem, validLineItem } = setValidItems(
      'validItem',
      1,
      true
    );
    api = setApiMock([validLineItem], [validDeliveryItem], false);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectTrackingResponse(data);
    expect(addDeliveryDataCallback).toBeCalledTimes(0);
  });

  test('test parcel added with no items', async () => {
    const trackingNumber = 'noItemsTrackingNumber';
    api = setApiMock([]);
    const message = setMessage(trackingNumber);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 1);
  });

  test('test parcel added with one item', async () => {
    const trackingNumber = 'oneValidItemTrackingNumber';
    const { validDeliveryItem, validLineItem, validTrackerItem } =
      setValidItems('oneParcelItem');
    api = setApiMock([validLineItem]);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 2, [
      validTrackerItem,
    ]);
  });

  test('test parcel added with wrong item', async () => {
    const trackingNumber = 'wrongItemTrackingNumber';
    const { validLineItem } = setValidItems('orderLineItem');
    const { validDeliveryItem } = setValidItems('parcelDeliveryItem');
    api = setApiMock([validLineItem]);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 3, []);
  });

  test('test parcel item from order delivery', async () => {
    const trackingNumber = 'orderDeliveryItemTrackingNumber';
    const { validLineItem, validDeliveryItem, validTrackerItem } =
      setValidItems('orderDeliveryitem');
    api = setApiMock([validLineItem], [validDeliveryItem]);
    const message = setMessage(trackingNumber);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 4, [
      validTrackerItem,
    ]);
  });

  test('test empty parcel items, but existing order delivery item', async () => {
    const trackingNumber = 'orderDeliveryItemTrackingNumber2';
    const { validLineItem, validDeliveryItem, validTrackerItem } =
      setValidItems('orderDeliveryitem');
    api = setApiMock([validLineItem], [validDeliveryItem]);
    const message = setMessage(trackingNumber, []);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 5, [
      validTrackerItem,
    ]);
  });

  test('test parcel added with multiple items', async () => {
    const trackingNumber = 'oneValidItemTrackingNumber';
    const itemsArray = itemsQuantity.map((quantity) => {
      return setValidItems(`arrayItems${quantity}`, quantity);
    });
    const validLineItems = itemsArray.map((item) => item.validLineItem);
    const validDeliveryItems = itemsArray.map((item) => item.validDeliveryItem);
    const validTrackerItems = itemsArray.map((item) => item.validTrackerItem);
    api = setApiMock(validLineItems);
    const message = setMessage(trackingNumber, validDeliveryItems);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 6, validTrackerItems);
  });

  test('test parcel added with some of multiple items', async () => {
    const trackingNumber = 'oneValidItemTrackingNumber';
    const itemsArray = itemsQuantity.map((quantity) => {
      return setValidItems(`arrayItems${quantity}`, quantity);
    });
    const validLineItems = itemsArray.map((item) => item.validLineItem);
    const validDeliveryItems = itemsArray
      .map((item) => item.validDeliveryItem)
      .slice(0, 2);
    const validTrackerItems = itemsArray
      .map((item) => item.validTrackerItem)
      .slice(0, 2);
    api = setApiMock(validLineItems);
    const message = setMessage(trackingNumber, validDeliveryItems);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 7, validTrackerItems);
  });

  test('test parcel added with some of multiple items from delivery', async () => {
    const trackingNumber = 'oneValidItemTrackingNumber';
    const itemsArray = itemsQuantity.map((quantity) => {
      return setValidItems(`arrayItems${quantity}`, quantity);
    });
    const validLineItems = itemsArray.map((item) => item.validLineItem);
    const validDeliveryItems = itemsArray
      .map((item) => item.validDeliveryItem)
      .slice(0, 2);
    const validTrackerItems = itemsArray
      .map((item) => item.validTrackerItem)
      .slice(0, 2);
    api = setApiMock(validLineItems, validDeliveryItems);
    const message = setMessage(trackingNumber, []);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    await expectSuccessFullTracking(data, trackingNumber, 8, validTrackerItems);
  });

  test('tracking is not supported for multi-tenant', async () => {
    process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS = 'true';
    const trackingNumber = 'multiTenantTrackingNumber';
    const { validDeliveryItem, validLineItem } = setValidItems(
      'validItem',
      1,
      true
    );
    api = setApiMock([validLineItem], [validDeliveryItem], false);
    const message = setMessage(trackingNumber, [validDeliveryItem]);
    const data = Buffer.from(JSON.stringify(message)).toString('base64');
    const request = {
      body: {
        message: {
          data: data,
        },
      },
    } as unknown as Request;
    const response = {} as unknown as Response;
    const next = jest.fn();
    await post(request as Request, response, next);
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(
      new Error('Tracking is not supported for multi-tenant')
    );
    process.env.PAYPAL_MULTI_TENANT_CLIENT_IDS = undefined;
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
