import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../payment-sdk';
import { paymentRoutes } from '../../routes/paypal-payment.route';
import { PayPalPaymentService } from '../../services/paypal-payment.service';

export default async function (server: FastifyInstance) {
  const paypalPaymentService = new PayPalPaymentService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
    ctPaymentMethodService: paymentSDK.ctPaymentMethodService,
    ctAPI: paymentSDK.ctAPI,
  });

  await server.register(paymentRoutes, {
    paymentService: paypalPaymentService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
  });
}
