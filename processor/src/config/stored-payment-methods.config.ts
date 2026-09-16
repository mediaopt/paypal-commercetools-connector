import { PaymentMethodType } from '../dtos/paypal-payment.dto';
import { getConfig } from './config';

export type StoredPaymentMethodsConfig = {
  enabled: boolean; // indicates if tokenization feature is enabled
  config: {
    paymentInterface: string; // paymentInterface to set
    allowedPaymentMethods: PaymentMethodType[];
  };
};

let storedPaymentMethodsConfigValidated: StoredPaymentMethodsConfig;

export const getStoredPaymentMethodsConfig = (): StoredPaymentMethodsConfig => {
  if (storedPaymentMethodsConfigValidated) {
    return storedPaymentMethodsConfigValidated;
  }

  storedPaymentMethodsConfigValidated = {
    enabled: getConfig().storedPaymentMethodsEnabled === 'true',
    config: {
      paymentInterface: getConfig().storedPaymentMethodsPaymentInterface,
      allowedPaymentMethods: [PaymentMethodType.CREDIT_CARD, PaymentMethodType.PAYPAL],
    },
  };

  return storedPaymentMethodsConfigValidated;
};
