import { paymentSDK } from '../payment-sdk';
import { PayPalPaymentService } from '../services/paypal-payment.service';

const paymentService = new PayPalPaymentService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
  ctPaymentMethodService: paymentSDK.ctPaymentMethodService,
  ctAPI: paymentSDK.ctAPI,
});

export const app = {
  services: {
    paymentService,
  },
};
