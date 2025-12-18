import {
  Cart,
  CentPrecisionMoney,
  DiscountOnTotalPrice,
  LineItem,
  Price,
  ProductVariant,
  TaxedPrice,
  TaxRate,
} from '@commercetools/platform-sdk';
import { UpdateActions } from '../src/types/index.types';

type PaymentStateMapData = [string, UpdateActions, boolean];

type LineItemPropsImportantForMappingTests = Pick<
export const dummyValidPaymentStatusData: Pick<
  Payment,
  'paymentStatus' | 'paymentMethodInfo'
> = {
  paymentStatus: { interfaceCode: 'code1', interfaceText: 'text1' },
  paymentMethodInfo: { method: 'method1' },
};

const upToDateDummyActions = [
  {
    action: 'setMethodInfoMethod',
    method: dummyValidPaymentStatusData.paymentMethodInfo.method,
  },
  {
    action: 'setStatusInterfaceText',
    interfaceText: dummyValidPaymentStatusData.paymentStatus.interfaceText,
  },
  {
    action: 'setStatusInterfaceCode',
    interfaceCode: dummyValidPaymentStatusData.paymentStatus.interfaceCode,
  },
];

const dummyInvalidActionParams = {
  method: 'different',
  interfaceText: 'different',
  interfaceCode: 'different',
};

export const paymentStateMappingWithResults: PaymentStateMapData[] = [
  ['different amount of actions', [], false],
  ...upToDateDummyActions.map(
    ({ action }, index) =>
      [
        `action ${action} missing`,
        upToDateDummyActions.map((item, index2) =>
          index2 === index ? { action: 'irrelevant action' } : item
        ),
        false,
      ] as PaymentStateMapData
  ),
  ...upToDateDummyActions.map(
    ({ action }, index) =>
      [
        `action ${action} params differ from current payment`,
        upToDateDummyActions.map((item, index2) =>
          index2 === index ? { action, ...dummyInvalidActionParams } : item
        ),
        false,
      ] as PaymentStateMapData
  ),
  ['up to date payment', upToDateDummyActions, true],
];

  LineItem,
  'name' | 'lineItemMode' | 'quantity'
> & {
  variant: Pick<ProductVariant, 'sku'>;
  price: Pick<Price, 'value'>;
  taxRate?: Pick<TaxRate, 'amount'>;
};

type TaxedPricePropsImportantForMappingTests = Omit<TaxedPrice, 'taxPortions'>;

type CartPropsImportantForMappingTests = Pick<
  Cart,
  | 'totalPrice'
  | 'discountOnTotalPrice'
  | 'taxCalculationMode'
  | 'taxMode'
  | 'taxRoundingMode'
  | 'priceRoundingMode'
  | 'directDiscounts'
  | 'discountCodes'
> & {
  lineItems: LineItemPropsImportantForMappingTests[];
  taxedPrice: TaxedPricePropsImportantForMappingTests;
  taxedShippingPrice?: TaxedPricePropsImportantForMappingTests;
};

export const longTestTimeoutMs = 20000;

const currencyData: Omit<CentPrecisionMoney, 'centAmount'> = {
  type: 'centPrecision',
  currencyCode: 'EUR',
  fractionDigits: 2,
};

const centPrice = (centAmount = 0): CentPrecisionMoney => ({
  ...currencyData,
  centAmount,
});

const taxedPrice = (
  totalNet = 0,
  totalGross = 0,
  totalTax = 0
): TaxedPricePropsImportantForMappingTests => ({
  totalGross: centPrice(totalGross),
  totalNet: centPrice(totalNet),
  totalTax: centPrice(totalTax),
});

const DEFAULT_EU_TAX_RATE = 0.19;

export const fullPriceData = (
  totalNet = 0,
  totalGross = 0,
  totalTax = 0,
  taxRate = DEFAULT_EU_TAX_RATE
) => ({
  taxedPrice: taxedPrice(totalNet, totalGross, totalTax),
  totalPrice: centPrice(totalGross),
  taxRate: { amount: taxRate },
});

const giftLineItem: LineItemPropsImportantForMappingTests = {
  name: {
    en: 'Bag ”Amanda B” Liebeskind brown',
  },
  variant: {
    sku: 'A0E2000000024BC',
  },
  price: {
    value: centPrice(24875),
  },
  quantity: 1,
  lineItemMode: 'GiftLineItem',
  ...fullPriceData(),
};

export const discountedLineitemWithTaxIncluded: LineItemPropsImportantForMappingTests =
  {
    ...giftLineItem,
    price: {
      value: centPrice(24875),
    },
    quantity: 1,
    lineItemMode: 'Standard',
    ...fullPriceData(16723, 19900, 3177),
  };

export const discountedLineItems = [
  giftLineItem,
  discountedLineitemWithTaxIncluded,
];

export const discountOnTotalPrice = (
  discountedAmount: number,
  discountedNetAmount: number,
  discountedGrossAmount: number
): DiscountOnTotalPrice => ({
  discountedAmount: centPrice(discountedAmount),
  includedDiscounts: [], //details about discounts are not required for mapping
  discountedNetAmount: centPrice(discountedNetAmount),
  discountedGrossAmount: centPrice(discountedGrossAmount),
});

const defaultRelevantForMappingCTCartParams = {
  priceRoundingMode: 'HalfEven',
  discountCodes: [],
  directDiscounts: [],
  taxMode: 'Platform',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
};

export const cartWithExternalRate: CartPropsImportantForMappingTests = {
  ...defaultRelevantForMappingCTCartParams,
  lineItems: [
    {
      name: {
        en: 'Bag ”Amanda B” Liebeskind brown',
      },
      variant: {
        sku: 'A0E2000000024BC',
      },
      price: {
        value: centPrice(19999),
      },
      quantity: 1,
      lineItemMode: 'Standard',
      ...fullPriceData(15629, 18599, 2970),
    },
    {
      name: {
        en: 'Bag ”Amanda B” Liebeskind red',
      },
      variant: {
        sku: 'A0E2000000024BD',
      },
      price: {
        value: centPrice(19999),
      },
      quantity: 1,
      lineItemMode: 'Standard',
      ...fullPriceData(18599, 22133, 3534),
    },
  ],
  ...fullPriceData(29778, 35437, 5659),
  taxedShippingPrice: taxedPrice(),
  discountOnTotalPrice: discountOnTotalPrice(4836, 4450, 5295),
};

export const multipleItemsCartWithUnitPriceTaxMode: CartPropsImportantForMappingTests =
  {
    ...defaultRelevantForMappingCTCartParams,
    lineItems: [
      {
        name: {
          en: 'Bag ”Amanda B” Liebeskind brown',
        },
        variant: {
          sku: 'A0E2000000024BC',
        },
        price: {
          value: centPrice(19999),
        },
        quantity: 3,
        lineItemMode: 'Standard',
        ...fullPriceData(46887, 55797, 8910),
      },
    ],
    ...fullPriceData(40791, 48543, 7752),
    discountOnTotalPrice: discountOnTotalPrice(7254, 6096, 7254),
    taxCalculationMode: 'UnitPriceLevel',
  };
