import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitPaymentRequestSchema,
  PaymentRequestSchemaDTO,
  InitPaymentResponseSchema,
  PaymentResponseSchemaDTO,
  CreateOrderRequestSchema,
  CreateOrderRequestSchemaDTO,
  CreateOrderResponseSchema,
  CreateOrderResponseSchemaDTO,
  AuthenticateThreeDSOrderRequestSchema,
  AuthenticateThreeDSOrderRequestSchemaDTO,
  AuthenticateThreeDSOrderResponseSchema,
  AuthenticateThreeDSOrderResponseSchemaDTO,
  OnApproveRequestSchema,
  OnApproveRequestSchemaDTO,
  OnApproveResponseSchema,
  OnApproveResponseSchemaDTO,
  UpdateShippingRequestSchema,
  UpdateShippingRequestSchemaDTO,
  UpdateShippingResponseSchema,
  UpdateShippingResponseSchemaDTO,
} from '../dtos/paypal-payment.dto';
import {
  StoredPaymentMethodsResponse,
  StoredPaymentMethodsResponseSchema,
} from '../dtos/stored-payment-methods.dto';
import { PayPalPaymentService } from '../services/paypal-payment.service';
import { Type } from '@sinclair/typebox';
import { log } from '../libs/logger';
import { getCartIdFromContext } from '../libs/fastify/context/context';

type PaymentRoutesOptions = {
  paymentService: PayPalPaymentService;
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const paymentRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & PaymentRoutesOptions) => {
  fastify.post<{ Body: PaymentRequestSchemaDTO; Reply: PaymentResponseSchemaDTO }>(
    '/payments',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: InitPaymentRequestSchema,
        response: {
          200: InitPaymentResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.createPayment(request.body);
      log.info(`createPayment: success, paymentId: ${resp.id}`);
      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: CreateOrderRequestSchemaDTO; Reply: CreateOrderResponseSchemaDTO }>(
    '/payments/createOrder',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: CreateOrderRequestSchema,
        response: {
          200: CreateOrderResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.createOrder(request.body);
      log.info(
        `createOrder: success, paymentId: ${request.body.paymentId}, orderId: ${resp.orderData.id}`
      );
      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: OnApproveRequestSchemaDTO; Reply: OnApproveResponseSchemaDTO }>(
    '/payments/authorize',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: OnApproveRequestSchema,
        response: {
          200: OnApproveResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.authorizeOrder(request.body);
      log.info(
        `authorizeOrder: success, paymentId: ${request.body.paymentId}, orderId: ${request.body.orderID}`
      );
      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: OnApproveRequestSchemaDTO; Reply: OnApproveResponseSchemaDTO }>(
    '/payments/approve',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: OnApproveRequestSchema,
        response: {
          200: OnApproveResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.captureOrder(request.body);
      log.info(
        `captureOrder: success, paymentId: ${request.body.paymentId}, orderId: ${request.body.orderID}`
      );
      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: AuthenticateThreeDSOrderRequestSchemaDTO; Reply: AuthenticateThreeDSOrderResponseSchemaDTO }>(
    '/payments/3ds',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: AuthenticateThreeDSOrderRequestSchema,
        response: {
          200: AuthenticateThreeDSOrderResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.authenticateThreeDSOrder(request.body);
      log.info(
        `authenticateThreeDSOrder: success, paymentId: ${request.body.paymentId}, orderId: ${request.body.orderID}`
      );
      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: UpdateShippingRequestSchemaDTO; Reply: UpdateShippingResponseSchemaDTO }>(
    '/payments/updateShipping',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: UpdateShippingRequestSchema,
        response: {
          200: UpdateShippingResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.updateShipping(request.body);
      log.info(
        `updateShipping: success, paymentId: ${request.body.paymentId}, orderId: ${request.body.orderID}`
      );
      return reply.status(200).send(resp);
    },
  );

  fastify.get<{ Reply: StoredPaymentMethodsResponse }>(
    '/stored-payment-methods',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        response: {
          200: StoredPaymentMethodsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await opts.paymentService.getStoredPaymentMethods();
      log.info(
        `getStoredPaymentMethods: success, cartId: ${getCartIdFromContext()}, count: ${
          result.storedPaymentMethods.length
        }`
      );
      return reply.status(200).send(result);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/stored-payment-methods/:id',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        params: Type.Object({ id: Type.String() }),
        response: {
          200: Type.Object({}),
        },
      },
    },
    async (request, reply) => {
      await opts.paymentService.deleteStoredPaymentMethod(request.params.id);
      return reply.status(200).send({});
    },
  );
};
