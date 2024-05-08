import { Request, Response } from 'express';

import { post } from '../src/controllers/service.controller';

const responseAction = { action: 'someAction', actionData: 'do someting' };
describe('test controller with wrong requests', () => {
  test.each([
    {
      action: 'Create',
      type: 'payment',
    },
    {
      action: 'Create',
      type: 'customer',
    },
    {
      action: '',
      type: '',
    },
    {
      action: 'Create',
      type: 'order',
    },
  ])('call $action $type', async ({ action, type }) => {
    const request = {
      body: {
        action: action,
        resource: {
          typeId: type,
        },
      },
    } as unknown as Request;
    const response = {} as unknown as Response;
    const next = jest.fn();
    await post(request, response, next);
    expect(next).toBeCalledTimes(1);
  });
});

jest.mock('../src/controllers/payments.controller', () => ({
  paymentController: () => {
    return Promise.resolve({
      statusCode: 200,
      actions: [responseAction],
    });
  },
}));

jest.mock('../src/controllers/customers.controller', () => ({
  customerController: () => {
    return Promise.resolve({
      statusCode: 200,
      actions: [responseAction],
    });
  },
}));

describe('test controller with correct requests', () => {
  test.each([
    {
      action: 'Create',
      type: 'payment',
    },
    {
      action: 'Create',
      type: 'customer',
    },
  ])('call $action $type', async ({ action, type }) => {
    const request = {
      body: {
        action: action,
        resource: {
          typeId: type,
        },
      },
    } as unknown as Request;

    const next = jest.fn();
    const mockInner = jest.fn(() => {});
    const mockWrapper = jest.fn(() => {
      return { json: mockInner };
    });

    const response = { status: mockWrapper } as unknown as Response;
    await post(request, response, next);
    expect(mockWrapper).toBeCalledTimes(1);
    expect(mockWrapper).toBeCalledWith(200);
    expect(mockInner).toBeCalledTimes(1);
    expect(mockInner).toBeCalledWith({
      actions: [responseAction],
    });
    expect(next).toBeCalledTimes(0);
  });
});
