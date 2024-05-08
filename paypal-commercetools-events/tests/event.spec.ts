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

describe('Testing PayPal-commercetools-events Controller', () => {
  function expectSuccessfulResponse(next: NextFunction, response: Response) {
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledTimes(1);
    expect(response.status).toBeCalledWith(204);
    expect(response.send).toBeCalledTimes(1);
    expect(response.send).toBeCalledWith();
  }

  test('test parcel added', async () => {
    const payPalOrderId = 1234;
    const captureId = 12345;
    const orderId = '123';
    api = {
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
    const trackingNumber = '123456';
    const message = {
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
        trackingData: {
          trackingId: trackingNumber,
          carrier: 'DHL',
        },
        key: '',
      },
    };
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
    expect(addDeliveryDataCallback).toBeCalledWith(payPalOrderId, {
      capture_id: captureId,
      carrier: 'DHL_API',
      carrier_name_other: undefined,
      tracking_number: trackingNumber,
    });
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
