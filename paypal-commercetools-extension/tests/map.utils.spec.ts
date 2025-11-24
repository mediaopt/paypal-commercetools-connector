import { Cart, TypedMoney } from '@commercetools/platform-sdk';
import { describe, test } from '@jest/globals';
import { RefundStatusEnum } from '../src/paypal/payments_api';
import {
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
  mapValidCommercetoolsLineItemsToPayPalItems,
} from '../src/utils/map.utils';
import { cartWithExternalRate, discountedLineItems } from './constants';

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

describe('Testing PayPal breakdown mapping for all methods except PayUponInvoice', () => {
  test.each([
    [false, 'LineItemLevel', discountedLineItems, null],
    [true, 'LineItemLevel', undefined, null],
    [true, 'LineItemLevel', [], []],
    [
      true,
      'LineItemLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00' },
        { quantity: '1', amount: '199.00' },
      ],
    ],
    [
      true,
      'UnitPriceLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00' },
        { quantity: '1', amount: '167.23' },
      ],
    ],
    [
      true,
      'LineItemLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '185.99' },
        { quantity: '1', amount: '221.33' },
      ],
    ],
    [
      true,
      'UnitPriceLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '156.29' },
        { quantity: '1', amount: '185.99' },
      ],
    ],
  ])(
    'if matching amounts is %p, tax is lineItemLevel %p, line items are %p, the expected quantities and amounts are %p',
    (matchingAmounts, isLineItemLevel, lineItems, result) => {
      const lineItemsMap = mapValidCommercetoolsLineItemsToPayPalItems(
        matchingAmounts,
        true,
        isLineItemLevel,
        false,
        lineItems
      );
      if (!result) expect(lineItemsMap).toBeNull();
      else if (lineItemsMap)
        lineItemsMap.forEach((item, index) => {
          expect(item.quantity).toBe(result[index].quantity);
          expect(item.unit_amount.value).toBe(result[index].amount);
        });
    }
  );
});

const paypalToCTEur = (payPalMoneyValue: string) =>
  parseFloat(payPalMoneyValue);

describe('Testing valid PayPal price breakdown mapping for all methods except Pay Upon Invoise', () => {
  test.each([[cartWithExternalRate]])('breakdown mapping', (cart: Cart) => {
    const paypalPrice = mapCommercetoolsCartToPayPalPriceBreakdown(cart);
    const payPalItems = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      cart.taxCalculationMode,
      false,
      cart.lineItems
    );
    expect(paypalPrice).toBeDefined();
    expect(payPalItems).toBeDefined();
    if (paypalPrice) {
      const discountValue = paypalPrice.discount?.value || '0.00';
      expect(cart.taxedPrice?.totalGross.centAmount).toBe(
        Math.round(
          (paypalToCTEur(paypalPrice.item_total.value) +
            paypalToCTEur(paypalPrice.tax_total.value) +
            paypalToCTEur(paypalPrice.shipping.value) -
            paypalToCTEur(discountValue)) *
            100
        )
      );
      if (payPalItems) {
        const totalItems = payPalItems
          .map(
            ({ quantity, unit_amount }) =>
              parseInt(quantity) * parseFloat(unit_amount.value)
          )
          .reduce((prev, current) => prev + current, 0);
        expect(totalItems.toFixed(2)).toBe(paypalPrice.item_total.value);
      }
    }
  });
});
