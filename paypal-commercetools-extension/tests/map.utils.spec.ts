import { TypedMoney } from '@commercetools/platform-sdk';
import { describe, test } from '@jest/globals';
import { RefundStatusEnum } from '../src/paypal/payments_api';
import {
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
} from '../src/utils/map.utils';

const refundStatusEnum = (status: string) => {
  return status as RefundStatusEnum;
};
describe('Testing map utilities', () => {
  test.each([
    { name: 'card', source: { card: { name: 'TEST' } } },
    { name: 'eps', source: { eps: { name: 'TEST' } } },
    {
      name: 'bancontact',
      source: { bancontact: { name: 'TEST' } },
    },
    { name: 'blik', source: { blik: { name: 'TEST' } } },
    { name: 'p24', source: { p24: { email: 'TEST' } } },
    { name: 'giropay', source: { giropay: { name: 'TEST' } } },
    { name: 'ideal', source: { ideal: { iban_last_chars: 'TEST' } } },
    { name: 'mybank', source: { mybank: { iban_last_chars: 'TEST' } } },
    { name: 'paypal', source: { paypal: { email_address: 'TEST' } } },
    { name: 'sofort', source: { sofort: { iban_last_chars: 'TEST' } } },
    { name: 'trustly', source: { trustly: { iban_last_chars: 'TEST' } } },
    { name: 'venmo', source: { venmo: { email_address: 'TEST' } } },
  ])('map $name', async ({ name, source }) => {
    const mapped = mapPayPalPaymentSourceToCommercetoolsMethodInfo(source);
    expect(mapped.toLowerCase()).toContain(name);
    expect(mapped).toContain('TEST');
  });

  test.each([
    {
      commercetoolsMoney: {
        centAmount: 1,
        fractionDigits: 2,
      } as TypedMoney,
      expectedPayPalAmount: '0.01',
    },
    {
      commercetoolsMoney: {
        centAmount: 6532,
        fractionDigits: 2,
      } as TypedMoney,
      expectedPayPalAmount: '65.32',
    },
    {
      commercetoolsMoney: {
        centAmount: 3097,
        fractionDigits: 2,
      } as TypedMoney,
      expectedPayPalAmount: '30.97',
    },
    {
      commercetoolsMoney: {
        centAmount: 1,
        fractionDigits: 3,
      } as TypedMoney,
      expectedPayPalAmount: '0.001',
    },
    {
      commercetoolsMoney: {
        centAmount: 6532,
        fractionDigits: 4,
      } as TypedMoney,
      expectedPayPalAmount: '0.6532',
    },
    {
      commercetoolsMoney: {
        centAmount: 3097,
        fractionDigits: 1,
      } as TypedMoney,
      expectedPayPalAmount: '309.7',
    },
  ])(
    'test mapping of commercetools amount to PayPal amount and vise versa',
    ({ commercetoolsMoney, expectedPayPalAmount }) => {
      expect(mapCommercetoolsMoneyToPayPalMoney(commercetoolsMoney)).toBe(
        expectedPayPalAmount
      );
      expect(
        mapPayPalMoneyToCommercetoolsMoney(
          expectedPayPalAmount,
          commercetoolsMoney.fractionDigits
        )
      ).toBe(commercetoolsMoney.centAmount);
    }
  );

  test.each([
    { paypalStatus: undefined, expectedResult: 'Failure' },
    { paypalStatus: refundStatusEnum('COMPLETED'), expectedResult: 'Success' },
    { paypalStatus: refundStatusEnum('FAILED'), expectedResult: 'Failure' },
    { paypalStatus: refundStatusEnum('CANCELLED'), expectedResult: 'Failure' },
    { paypalStatus: refundStatusEnum('PENDING'), expectedResult: 'Pending' },
    { paypalStatus: refundStatusEnum('bla'), expectedResult: 'Pending' },
  ])(
    'paypal refund status to commercetools transaction state',
    async ({ paypalStatus, expectedResult }) => {
      expect(
        mapPayPalRefundStatusToCommercetoolsTransactionState(paypalStatus)
      ).toBe(expectedResult);
    }
  );

  test.each([
    {
      carrier: undefined,
      shippingCountry: undefined,
      expectedCarrier: 'OTHER',
    },
    {
      carrier: undefined,
      shippingCountry: 'DE',
      expectedCarrier: 'OTHER',
    },
    { carrier: 'OTHER', shippingCountry: undefined, expectedCarrier: 'OTHER' },
    { carrier: 'OTHER', shippingCountry: 'DE', expectedCarrier: 'OTHER' },
    { carrier: 'DHL', shippingCountry: undefined, expectedCarrier: 'DHL' },
    { carrier: 'DHL', shippingCountry: 'DE', expectedCarrier: 'DHL_API' },
  ])(
    'test mapping of commercetools carrier to paypal',
    async ({ carrier, shippingCountry, expectedCarrier }) => {
      expect(
        mapCommercetoolsCarrierToPayPalCarrier(carrier, shippingCountry)
      ).toBe(expectedCarrier);
    }
  );
});
