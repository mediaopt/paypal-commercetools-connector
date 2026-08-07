/**
 * See also paypal-extension customer service.
 */
import { Customer, CustomerSetCustomFieldAction, CustomerUpdateAction } from '@commercetools/connect-payments-sdk';

import { log } from '../libs/logger';

import { DefaultCommercetoolsAPI } from '@commercetools/connect-payments-sdk/dist/commercetools/api/root-api';

export type PayPalCustomerServiceOptions = {
  ctAPI: DefaultCommercetoolsAPI;
};

export class PayPalCustomerService {
  private ctAPI: DefaultCommercetoolsAPI;

  constructor(opts: PayPalCustomerServiceOptions) {
    this.ctAPI = opts.ctAPI;
  }

  public async getCtCustomer(ctCustomerId: string): Promise<Customer | void> {
    return await this.ctAPI.client
      .customers()
      .withId({ ID: ctCustomerId })
      .get()
      .execute()
      .then((response) => response.body)
      .catch((err) => {
        log.warn(`Customer not found ${ctCustomerId}`, { error: err });
        return;
      });
  }

  public async updateCtCustomer(
    ctCustomerId: string,
    ctCustomerVersion: number,
    actions: CustomerUpdateAction[],
  ): Promise<Customer | void> {
    return await this.ctAPI.client
      .customers()
      .withId({ ID: ctCustomerId })
      .post({ body: { version: ctCustomerVersion, actions } })
      .execute()
      .then((response) => response.body)
      .catch((err) => {
        log.warn(`Could not update customer ${ctCustomerId}`, { error: err });
        return;
      });
  }

  public async linkPayPalCustomerId(ctCustomerId: string, paypalCustomerId: string): Promise<void> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000; //timing selected based on permitted time for resolve for payment connector operations
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const ctCustomer = await this.getCtCustomer(ctCustomerId);
      if (!ctCustomer || ctCustomer.custom?.fields?.paypalCustomerId) return;
      const action: CustomerSetCustomFieldAction = {
        action: 'setCustomField',
        name: 'paypalCustomerId',
        value: paypalCustomerId,
      };
      const result = await this.updateCtCustomer(ctCustomer.id, ctCustomer.version, [action]);
      if (result) return;
      log.warn(`linkPayPalCustomerId: attempt ${attempt}/${MAX_RETRIES} failed for customer ${ctCustomerId}`);
      if (attempt < MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
    log.error(
      `linkPayPalCustomerId: all ${MAX_RETRIES} attempts failed for customer ${ctCustomerId}. ` +
        `PayPal customer ID "${paypalCustomerId}" was not persisted to CT — stored payment methods will not be visible for this customer until resolved manually.`,
    );
  }
}
