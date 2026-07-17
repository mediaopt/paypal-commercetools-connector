import {
  Cart,
  LineItem,
  Payment,
  TaxCalculationMode,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { describe, test } from '@jest/globals';
import { RefundStatusEnum } from '../src/paypal/payments_api';
import { UpdateActions } from '../src/types/index.types';

jest.mock('../src/utils/logger.utils', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { logger } from '../src/utils/logger.utils';
import {
  isPaymentUpToDate,
  mapCommercetoolsAddressToPayPalAddress,
  mapCommercetoolsCarrierToPayPalCarrier,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalMoneyToCommercetoolsMoney,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
  mapValidCommercetoolsLineItemsToPayPalItems,
  resolveCommercetoolsCartShippingAddress,
} from '../src/utils/map.utils';
import {
  cartFromCartData,
  CartGenerationData,
  complexCartsData,
  dummyAddress,
  dummyValidPaymentStatusData,
  lineItemFromLineItemData,
  LineItemGenerationData,
  LineItemTestData,
  multiShippingData,
  paymentStateMappingWithResults,
  singleLineItemTypeCartsDataWithMatchingTotal,
  testLineItemsWithExpectationsExternalTax,
  testLineItemsWithExpectationsLineItemMode,
  testLineItemsWithExpectationsUnitPriceMode,
} from './constants';

const refundStatusEnum = (status: string) => {
  return status as RefundStatusEnum;
};

const paypalToCTEur = (payPalMoneyValue = '') =>
  Math.round(parseFloat(payPalMoneyValue) * 100);

describe('isPaymentUpToDate verification', () => {
  test.each(paymentStateMappingWithResults)(
    'testing %p with actions %p results in %p up to date state',
    (description, actions, result) => {
      // paymentStateMappingWithResults deliberately mixes fields from
      // different actions to exercise the "not up to date" branches, so
      // these fixtures can never satisfy the strict UpdateActions union —
      // the cast is intentional, not a shape we expect at runtime.
      const isUpToDate = isPaymentUpToDate(
        dummyValidPaymentStatusData as Payment,
        actions as unknown as UpdateActions
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

describe('Testing mapping of payment amounts between PayPal and Commercetools', () => {
  test.each([
    {
      commercetoolsMoney: {
        centAmount: 0,
        fractionDigits: 2,
      } as TypedMoney,
      expectedPayPalAmount: '0.00',
    },
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
    'test mapping of commercetools amount $commercetoolsMoney.centAmount to PayPal amount $expectedPayPalAmount and vise versa',
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

  test('undefined ct items leads to null mapped items', () => {
    const noLineItemsMapping = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      'LineItemLevel',
      false,
      undefined
    );
    expect(noLineItemsMapping).toBeNull();
  });

  test('no ct items leads to null mapped items', () => {
    const noLineItemsMapping = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      'LineItemLevel',
      false,
      [] as LineItem[]
    );
    expect(noLineItemsMapping?.length).toEqual(0);
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

const expectValidLineItemMapping = (
  lineItems: (LineItemGenerationData & {
    expectedUnitAmount?: number;
    expectedTax?: number;
  })[],
  taxCalculationMode: TaxCalculationMode = 'LineItemLevel',
  isPayUponInvoice = true,
  locale?: string
) => {
  const payPalItems = mapValidCommercetoolsLineItemsToPayPalItems(
    true,
    true,
    taxCalculationMode,
    isPayUponInvoice,
    lineItems.map(lineItemFromLineItemData) as LineItem[],
    locale
  );
  expect(payPalItems).toBeDefined();
  payPalItems?.forEach(
    ({ name, description, quantity, tax, tax_rate, unit_amount }, index) => {
      const referenceItem = lineItems[index];

      if (isPayUponInvoice) {
        expect(tax_rate).toBeDefined();
        expect(paypalToCTEur(tax?.value)).toEqual(
          referenceItem.expectedTax ?? 0
        );
      } else {
        expect(tax_rate).toBeUndefined();
        expect(tax).toBeUndefined();
      }
      if (referenceItem.lineItemMode === 'GiftLineItem')
        expect(description).toContain('GIFT_ITEM');
      else expect(description).not.toContain('GIFT_ITEM');
      expect(quantity).toEqual('1');
      if (referenceItem.quantity > 1)
        expect(name).toContain(`(x${referenceItem.quantity})`);
      else expect(name).toBeDefined();
      expect(paypalToCTEur(unit_amount.value)).toEqual(
        referenceItem.expectedUnitAmount ?? 0
      );
    }
  );
};

describe('mapping of valid commercetools items to PayPal items', () => {
  describe('no tax and tax rate are provided if the method is not PayUponInvoice', () => {
    test('defaultItem', () => {
      expectValidLineItemMapping(
        [testLineItemsWithExpectationsLineItemMode.singleDefault],
        'LineItemLevel',
        false
      );
    });

    test('unit price level item with not included in price tax', () => {
      expectValidLineItemMapping(
        [testLineItemsWithExpectationsUnitPriceMode.tripleNotIncludedPrice],
        'UnitPriceLevel',
        false
      );
    });
  });

  describe('some name will be provided for whatever locales combination product and cart have', () => {
    const expectLocaleName = (
      itemKey: keyof typeof testLineItemsWithExpectationsLineItemMode,
      expectedName: string,
      cartLocale?: string
    ) => {
      const payPalItems = mapValidCommercetoolsLineItemsToPayPalItems(
        true,
        true,
        'LineItemLevel',
        false,
        [
          lineItemFromLineItemData(
            testLineItemsWithExpectationsLineItemMode[itemKey]
          ),
        ] as LineItem[],
        cartLocale
      );
      expect(payPalItems).toBeDefined();

      if (payPalItems) {
        expect(payPalItems.length).toEqual(1);
        expect(payPalItems[0].name).toEqual(expectedName);
      }
    };
    test.each([
      [
        'item name has this cart locale',
        'singleDefault',
        'nameamanda gray',
        'en',
      ],
      [
        'item name locales do not include this cart locale',
        'singleDefault',
        'nameamanda gray',
        'ua',
      ],
      [
        'cart has no locale, item has some',
        'singleDefault',
        'nameamanda gray',
        undefined,
      ],
      ['item name is empty object', 'nameless', 'id0', undefined],
    ])(
      `name is provided for %s`,
      (description, itemKey, expectedName, cartLocale) => {
        expectLocaleName(itemKey, expectedName, cartLocale);
      }
    );
  });

  describe('test mapping for different tax calculation modes', () => {
    const expectMappingForTaxModes = (
      description: string,
      taxMode: string,
      data: LineItemTestData
    ) => {
      describe(`${description} for ${taxMode}`, () => {
        test.each(Object.values(data))('$testDescription ', (lineItemData) =>
          expectValidLineItemMapping([lineItemData], taxMode)
        );
      });
    };

    expectMappingForTaxModes(
      'the item price matches total gross',
      'LineItemLevel',
      testLineItemsWithExpectationsLineItemMode
    );

    expectMappingForTaxModes(
      'the item price matches total net',
      'UnitPriceLevel',
      testLineItemsWithExpectationsUnitPriceMode
    );

    expectMappingForTaxModes(
      'for External Tax calculations the item price matches total if provided and (discounted) item price if not',
      'LineItemLevel',
      testLineItemsWithExpectationsExternalTax
    );
  });
});

describe('PayPal breakdown mapping', () => {
  const expectCartMapping = (
    cartData: CartGenerationData,
    expectedDiscount?: number,
    expectedShipping = 0,
    expectedTax = 0
  ) => {
    const dummyCart = cartFromCartData(cartData) as Cart;
    const paypalPrice = mapCommercetoolsCartToPayPalPriceBreakdown(dummyCart);
    expect(paypalPrice).toBeDefined();
    if (paypalPrice) {
      expect(
        paypalToCTEur(paypalPrice.item_total?.value)
      ).toBeGreaterThanOrEqual(0);
      if (expectedDiscount === undefined)
        expect(paypalPrice.discount).toBeUndefined();
      else {
        expect(paypalPrice.discount).toBeDefined();
        expect(paypalToCTEur(paypalPrice.discount?.value)).toEqual(
          expectedDiscount
        );
      }

      expect(paypalToCTEur(paypalPrice.shipping?.value)).toEqual(
        expectedShipping
      );
      expect(paypalToCTEur(paypalPrice.tax_total?.value)).toEqual(expectedTax);

      const discountValue = paypalPrice.discount?.value || '0.00';

      expect(dummyCart.totalPrice.centAmount).toBe(
        paypalToCTEur(paypalPrice.item_total?.value) +
          paypalToCTEur(paypalPrice.tax_total?.value) +
          paypalToCTEur(paypalPrice.shipping?.value) -
          paypalToCTEur(discountValue)
      );
    }

    const payPalItems = mapValidCommercetoolsLineItemsToPayPalItems(
      true,
      true,
      dummyCart.taxCalculationMode,
      false,
      dummyCart.lineItems
    );
    expect(payPalItems).toBeDefined();

    if (payPalItems) {
      expect(payPalItems.length).toEqual(dummyCart.lineItems.length);
      const totalItems = payPalItems
        .map(
          ({ quantity, unit_amount }) =>
            parseInt(quantity) * parseFloat(unit_amount.value)
        )
        .reduce((prev, current) => prev + current, 0);
      expect(totalItems.toFixed(2)).toBe(paypalPrice?.item_total.value);
    }
  };

  test.each(singleLineItemTypeCartsDataWithMatchingTotal)(
    'formal breakdown criteria (total price matches total item price, all else is zero or undefined) are fulfilled for cart with $testDescription',
    ({ cartData }) => {
      expectCartMapping(cartData);
    }
  );

  test.each(complexCartsData)(
    'complex carts if relevant have matching discount, shipping and tax for $testDescription',
    ({ cartData, expectedDiscount, expectedShipping, expectedTax }) => {
      expectCartMapping(
        cartData,
        expectedDiscount,
        expectedShipping,
        expectedTax
      );
    }
  );

  test.each(multiShippingData)(
    'multiple shipping carts have matching discount, shipping and no tax for $testDescription',
    ({ cartData, expectedShipping, expectedDiscount, expectedTax }) => {
      expectCartMapping(
        cartData,
        expectedDiscount,
        expectedShipping,
        expectedTax
      );
    }
  );
});

describe('mapCommercetoolsAddressToPayPalAddress', () => {
  test('returns undefined when no address is given', () => {
    expect(mapCommercetoolsAddressToPayPalAddress(undefined)).toBeUndefined();
  });

  test('maps a complete commercetools address to the PayPal shipping shape', () => {
    expect(mapCommercetoolsAddressToPayPalAddress(dummyAddress())).toEqual({
      type: 'SHIPPING',
      name: { full_name: 'Jane Doe' },
      address: {
        address_line_1: 'Main Street 1',
        admin_area_2: 'Berlin',
        postal_code: '10115',
        country_code: 'DE',
      },
    });
  });
});

describe('resolveCommercetoolsCartShippingAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('passes through cart.shippingAddress for shippingMode Single', () => {
    const address = dummyAddress();
    const cart = cartFromCartData({
      lineItemsData: [{ itemType: 'defaultItem', quantity: 1 }],
      customCardProps: { shippingMode: 'Single', shippingAddress: address },
    }) as Cart;

    expect(resolveCommercetoolsCartShippingAddress(cart, 'payment-single')).toEqual(
      { address, hasMultipleAddresses: false }
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('resolves the single address of a Multiple-mode cart with one shipping method', () => {
    const address = dummyAddress();
    const cart = cartFromCartData({
      lineItemsData: [
        {
          itemType: 'defaultItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method1', quantity: 1 }],
            valid: true,
          },
        },
      ],
      customCardProps: {
        shippingMode: 'Multiple',
        shipping: [{ shippingKey: 'method1', shippingAddress: address }],
      },
    }) as Cart;

    expect(resolveCommercetoolsCartShippingAddress(cart, 'payment-1')).toEqual({
      address,
      hasMultipleAddresses: false,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('does not flag two shipping methods sharing the same address as multiple addresses', () => {
    const address = dummyAddress();
    const cart = cartFromCartData({
      lineItemsData: [
        {
          itemType: 'defaultItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method1', quantity: 1 }],
            valid: true,
          },
        },
        {
          itemType: 'productDiscountItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method2', quantity: 1 }],
            valid: true,
          },
        },
      ],
      customCardProps: {
        shippingMode: 'Multiple',
        shipping: [
          { shippingKey: 'method1', shippingAddress: address },
          { shippingKey: 'method2', shippingAddress: address },
        ],
      },
    }) as Cart;

    expect(resolveCommercetoolsCartShippingAddress(cart, 'payment-2')).toEqual({
      address,
      hasMultipleAddresses: false,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('picks the first complete address and logs when shipping methods have distinct addresses', () => {
    const incompleteAddress = dummyAddress({ postalCode: undefined });
    const completeAddress = dummyAddress({ city: 'Munich' });
    const cart = cartFromCartData({
      lineItemsData: [
        {
          itemType: 'defaultItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method1', quantity: 1 }],
            valid: true,
          },
        },
        {
          itemType: 'productDiscountItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method2', quantity: 1 }],
            valid: true,
          },
        },
      ],
      customCardProps: {
        shippingMode: 'Multiple',
        shipping: [
          { shippingKey: 'method1', shippingAddress: incompleteAddress },
          { shippingKey: 'method2', shippingAddress: completeAddress },
        ],
      },
    }) as Cart;

    expect(resolveCommercetoolsCartShippingAddress(cart, 'payment-3')).toEqual({
      address: completeAddress,
      hasMultipleAddresses: true,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('payment-3')
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'address(es) skipped for missing required fields'
      )
    );
  });

  test('logs when a line item has no assigned shipping target', () => {
    const address = dummyAddress();
    const cart = cartFromCartData({
      lineItemsData: [
        { itemType: 'defaultItem', quantity: 1 },
        {
          itemType: 'productDiscountItem',
          quantity: 1,
          shippingDetails: {
            targets: [{ shippingMethodKey: 'method1', quantity: 1 }],
            valid: true,
          },
        },
      ],
      customCardProps: {
        shippingMode: 'Multiple',
        shipping: [{ shippingKey: 'method1', shippingAddress: address }],
      },
    }) as Cart;

    expect(resolveCommercetoolsCartShippingAddress(cart, 'payment-4')).toEqual({
      address,
      hasMultipleAddresses: false,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'line item(s) have no assigned shipping address'
      )
    );
  });
});
