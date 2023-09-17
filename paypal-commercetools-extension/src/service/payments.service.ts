import { Payment } from '@commercetools/platform-sdk';
import { UpdateAction } from '@commercetools/sdk-client-v2';

export const handleCreateOrderRequest = (payment: Payment): UpdateAction[] => {
  if (!payment.custom?.fields.createPayPalOrderRequest) {
    return [];
  }
  // @TODO
  return [];
};
