import {
  Cart,
  LineItem,
  Payment,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { describe, test } from '@jest/globals';
import { RefundStatusEnum } from '../src/paypal/payments_api';
import {
  isPaymentUpToDate,
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
  mapValidCommercetoolsLineItemsToPayPalItems,
} from '../src/utils/map.utils';
import {
  cardFromCardData,
  cartWithExternalRate,
  discountedCartsData,
  discountedLineItems,
  dummyValidPaymentStatusData,
  lineItemFromLineItemData,
  LineItemGenerationData,
  multipleItemsCartWithUnitPriceTaxMode,
  paymentStateMappingWithResults,
  shippedCarts,
  simpleCartsDataWithLineItemMode,
  simpleCartsDataWithUnitPriceMode,
} from './constants';
import { Item } from '../src/paypal/checkout_api';
import { logger } from '../src/utils/logger.utils';

const refundStatusEnum = (status: string) => {
  return status as RefundStatusEnum;
};

const paypalToCTEur = (payPalMoneyValue = '') =>
  Math.round(parseFloat(payPalMoneyValue) * 100);

describe('isPaymentUpToDate verification', () => {
  test.each(paymentStateMappingWithResults)(
    'testing %p with actions %p results in %p up to date state',
    (description, actions, result) => {
      const isUpToDate = isPaymentUpToDate(
        dummyValidPaymentStatusData as Payment,
        actions
      );
      expect(isUpToDate).toEqual(result);
    }
  );
});

describe('Test payment source mapping', () => {
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
  ])(
    'map $name payment method returns method and relevant payment details',
    async ({ name, source }) => {
      const mapped = mapPayPalPaymentSourceToCommercetoolsMethodInfo(source);
      expect(mapped.toLowerCase()).toContain(name);
      expect(mapped).toContain('TEST');
    }
  );
});

describe('Testing mapping of payment between PayPal and Commercetools', () => {
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
});

describe('Testing mapping statuses between PayPal and Commercetools', () => {
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
});

describe('Testing map carriers between PayPal and commercetools', () => {
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

describe('Testing PayPal breakdown mapping for mapping not possible', () => {
  test('amounts do not match leads to null mapped items', () => {
    const amountsDoesntMatchMapping =
      mapValidCommercetoolsLineItemsToPayPalItems(
        false,
        true,
        'LineItemLevel',
        false,
        []
      );
    expect(amountsDoesntMatchMapping).toBeNull();
  });

  test('no valid items leads to null mapped items', () => {
    const noLineItemsMapping = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      'LineItemLevel',
      false,
      undefined
    );
    expect(noLineItemsMapping).toBeNull();
  });

  test('negative price of an item leads to null mapped items', () => {
    const negativePriceMapping = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      'LineItemLevel',
      false,
      [
        lineItemFromLineItemData({
          itemType: 'defaultItem',
          gross: -2,
          quantity: 1,
        }) as LineItem,
      ]
    );
    expect(negativePriceMapping).toBeNull();
  });
});

const expectPayPalItem = (
  ctLineItemData: LineItemGenerationData,
  mappedItem: Item & { tax_rate?: string },
  expectedMatch: 'gross' | 'net' = 'gross',
  isPayUponInvoice = false
) => {
  expect(mappedItem.quantity).toBe('1');
  if (ctLineItemData.quantity > 1)
    expect(mappedItem.name).toContain(`(x${ctLineItemData.quantity})`);
  expect(paypalToCTEur(mappedItem.unit_amount.value)).toBe(
    ctLineItemData[expectedMatch]
  );
  if (!isPayUponInvoice) expect(mappedItem?.tax).toBeUndefined();
  else
    expect(paypalToCTEur(mappedItem.tax?.value)).toEqual(
      expectedMatch === 'gross' ? 0 : ctLineItemData.tax
    );
};

describe('Testing PayPal breakdown mapping for single item type card in LineItemMode, no discount, no shipping, no PUI)', () => {
  test.each(simpleCartsDataWithLineItemMode)(
    `for line item mode total price matches total gross and there is no tax or discount`,
    (cartData) => {
      const dummyCart = cardFromCardData(cartData) as Cart;
      const ctLineItemData = cartData.lineItemsData[0];
      const mapping = mapCommercetoolsCartToPayPalPriceBreakdown(dummyCart);
      expect(mapping).toBeDefined();
      expect(mapping?.discount).toBeUndefined();
      expect(mapping?.shipping.value).toBe('0.00');
      expect(mapping?.tax_total.value).toBe('0.00');
      expect(paypalToCTEur(mapping?.item_total.value)).toEqual(
        ctLineItemData.gross
      );

      const itemsMap = mapValidCommercetoolsLineItemsToPayPalItems(
        true,
        true,
        dummyCart.taxCalculationMode,
        false,
        dummyCart.lineItems
      );
      expect(itemsMap).toBeDefined();
      expect(itemsMap?.length).toEqual(1);
      if (itemsMap?.[0]) expectPayPalItem(ctLineItemData, itemsMap[0]);
    }
  );
});

describe('Testing PayPal breakdown mapping for single item type cards in UnitPriceMode, no discount, no shipping)', () => {
  test.each(simpleCartsDataWithUnitPriceMode)(
    `for line item mode total price matches total net and there is tax, but no discount`,
    (cartData) => {
      const mapping = mapCommercetoolsCartToPayPalPriceBreakdown(
        cardFromCardData(cartData) as Cart
      );
      expect(mapping).toBeDefined();
      expect(mapping?.discount).toBeUndefined();
      expect(mapping?.shipping.value).toBe('0.00');
      expect(paypalToCTEur(mapping?.tax_total.value)).toEqual(
        cartData.lineItemsData[0].tax
      );
      expect(paypalToCTEur(mapping?.item_total.value)).toEqual(
        cartData.lineItemsData[0].net
      );
    }
  );
});

describe('Testing PayPal breakdown mapping for single item type card in LineItemMode with discount, no shipping)', () => {
  test.each(discountedCartsData)(
    `for line item mode total price matches total gross and there is no tax but is discount`,
    (cartData) => {
      const mapping = mapCommercetoolsCartToPayPalPriceBreakdown(
        cardFromCardData(cartData) as Cart
      );
      expect(mapping).toBeDefined();
      expect(paypalToCTEur(mapping?.discount?.value)).toEqual(
        cartData.discount?.gross
      );
      expect(mapping?.shipping.value).toBe('0.00');
      expect(mapping?.tax_total.value).toBe('0.00');
      expect(paypalToCTEur(mapping?.item_total.value)).toEqual(
        cartData.lineItemsData[0].gross
      );
    }
  );
});

describe('Testing PayPal breakdown mapping for multiple items type card in UnitPriceLevel mode with discount and shipping)', () => {
  test.each(shippedCarts)(
    `for unit price mode total price matches total net and there are tax and discount`,
    (cartData) => {
      const mapping = mapCommercetoolsCartToPayPalPriceBreakdown(
        cardFromCardData(cartData) as Cart
      );
      expect(mapping).toBeDefined();
      logger.info('mapping');
      logger.info(JSON.stringify(cardFromCardData(cartData)));
      logger.info(JSON.stringify(mapping));

      expect(paypalToCTEur(mapping?.discount?.value)).toEqual(
        cartData.discount?.gross
      );
      expect(mapping?.shipping.value).toBe('10.00');
    }
  );
});

describe('Testing PayPal breakdown mapping for all methods except PayUponInvoice', () => {
  test.each([
    ['LineItemLevel', [], []],
    [
      'LineItemLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00' },
        { quantity: '1', amount: '199.00' },
      ],
    ],
    [
      'UnitPriceLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00' },
        { quantity: '1', amount: '167.23' },
      ],
    ],
    [
      'LineItemLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '185.99' },
        { quantity: '1', amount: '221.33' },
      ],
    ],
    [
      'UnitPriceLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '156.29' },
        { quantity: '1', amount: '185.99' },
      ],
    ],
  ])(
    'if matching amounts is %p, tax is %p, line items are %p, the expected quantities and amounts are %p',
    (isLineItemLevel, lineItems, result) => {
      const lineItemsMap = mapValidCommercetoolsLineItemsToPayPalItems(
        true,
        true,
        isLineItemLevel,
        false,
        lineItems as LineItem[] | undefined
      );
      lineItemsMap?.forEach((item, index) => {
        expect(item.quantity).toBe(result[index].quantity);
        expect(item.unit_amount.value).toBe(result[index].amount);
        expect(item.tax).toBeUndefined();
      });
    }
  );
});

describe('Testing valid PayPal breakdown mapping for Pay Upon Invoice only', () => {
  test.each([
    ['LineItemLevel', [], []],
    [
      'LineItemLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00', tax: '0.00' },
        { quantity: '1', amount: '199.00', tax: '0.00' },
      ],
    ],
    [
      'UnitPriceLevel',
      discountedLineItems,
      [
        { quantity: '1', amount: '0.00', tax: '0.00' },
        { quantity: '1', amount: '167.23', tax: '31.77' },
      ],
    ],
    [
      'LineItemLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '185.99', tax: '0.00' },
        { quantity: '1', amount: '221.33', tax: '0.00' },
      ],
    ],
    [
      'UnitPriceLevel',
      cartWithExternalRate.lineItems,
      [
        { quantity: '1', amount: '156.29', tax: '29.70' },
        { quantity: '1', amount: '185.99', tax: '35.34' },
      ],
    ],
    [
      'UnitPriceLevel',
      multipleItemsCartWithUnitPriceTaxMode.lineItems,
      [
        {
          quantity: '1',
          amount: '468.87',
          tax: '89.10',
        },
      ],
    ],
  ])(
    'if amounts match, tax is %p, line items are %p, the expected quantities and amounts are %p',
    (isLineItemLevel, lineItems, result) => {
      const lineItemsMap = mapValidCommercetoolsLineItemsToPayPalItems(
        true,
        true,
        isLineItemLevel,
        true,
        lineItems as LineItem[] | undefined
      );
      lineItemsMap?.forEach((item, index) => {
        expect(item.quantity).toBe(result[index].quantity);
        expect(item.unit_amount.value).toBe(result[index].amount);
        expect(item?.tax?.value).toBe(result[index].tax);
      });
    }
  );
});

describe('Testing invalid card mapping', () => {
  test('no line items lead to no price mapping', () => {
    const emptyItemsListMapping = mapCommercetoolsCartToPayPalPriceBreakdown({
      lineItems: [],
    } as unknown as Cart);
    expect(emptyItemsListMapping).toBeUndefined();
  });
});

describe('Testing valid PayPal price breakdown mapping for all methods except Pay Upon Invoice', () => {
  test.each([[cartWithExternalRate]])('breakdown mapping', (cart) => {
    const paypalPrice = mapCommercetoolsCartToPayPalPriceBreakdown(
      cart as Cart
    );
    const payPalItems = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      cart.taxCalculationMode,
      false,
      cart.lineItems as LineItem[] | undefined
    );
    expect(paypalPrice).toBeDefined();
    expect(payPalItems).toBeDefined();
    if (paypalPrice) {
      const discountValue = paypalPrice.discount?.value || '0.00';
      expect(cart.taxedPrice?.totalGross.centAmount).toBe(
        paypalToCTEur(paypalPrice.item_total.value) +
          paypalToCTEur(paypalPrice.tax_total.value) +
          paypalToCTEur(paypalPrice.shipping.value) -
          paypalToCTEur(discountValue)
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
