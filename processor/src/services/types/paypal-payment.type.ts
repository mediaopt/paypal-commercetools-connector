import { CommercetoolsCartService, CommercetoolsPaymentService, CommercetoolsPaymentMethodService } from '@commercetools/connect-payments-sdk';
import { DefaultCommercetoolsAPI } from '@commercetools/connect-payments-sdk/dist/commercetools/api/root-api';

export type PayPalPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctPaymentMethodService: CommercetoolsPaymentMethodService;
  ctAPI: DefaultCommercetoolsAPI;
};
