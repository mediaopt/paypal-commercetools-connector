import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitPaymentRequestSchema,
  PaymentRequestSchemaDTO,
  InitPaymentResponseSchema,
  PaymentResponseSchemaDTO,
  PaymentUpdateResponseSchema,
  PaymentUpdateResponseSchemaDTO,
} from '../dtos/paypal-payment.dto';
import { PayPalPaymentService } from '../services/paypal-payment.service';
import { Type } from '@sinclair/typebox';

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
      return reply.status(200).send(resp);
    },
  );

  fastify.get<{ Reply: PaymentUpdateResponseSchemaDTO }>(
    '/stored-payment-methods',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        response: {
          200: PaymentUpdateResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await opts.paymentService.getStoredPaymentMethods();
      return reply.status(200).send(result);
    },
  );
};
