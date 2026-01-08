import {
  Cart,
  CentPrecisionMoney,
  DiscountOnTotalPrice,
  LineItem,
  LineItemMode,
  Payment,
  Price,
  ProductVariant,
  TaxedPrice,
  TaxRate,
} from '@commercetools/platform-sdk';
import { UpdateActions } from '../src/types/index.types';

type PaymentStateMapData = [string, UpdateActions, boolean];

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

type RelevantQuantityIndependentLineItemProps = Pick<
  LineItem,
  'name' | 'lineItemMode'
> & {
  variant: Pick<ProductVariant, 'sku'>;
  taxRate?: Pick<TaxRate, 'amount'>;
  price: Pick<Price, 'value'>;
};

type TaxedPricePropsImportantForMappingTests = Omit<TaxedPrice, 'taxPortions'>;

type LineItemPropsImportantForMappingTests =
  RelevantQuantityIndependentLineItemProps &
    Pick<LineItem, 'quantity' | 'totalPrice'> & {
      taxedPrice: TaxedPricePropsImportantForMappingTests;
    };

type CartPropsImportantForMappingTests = Pick<
  Cart,
  | 'totalPrice'
  | 'taxCalculationMode'
  | 'taxMode'
  | 'taxRoundingMode'
  | 'priceRoundingMode'
  | 'directDiscounts'
  | 'discountCodes'
  | 'locale'
> & {
  lineItems: LineItemPropsImportantForMappingTests[];
  taxedPrice: TaxedPricePropsImportantForMappingTests;
  shippingInfo?: { taxedPrice: TaxedPricePropsImportantForMappingTests };
  discountOnTotalPrice?: Omit<DiscountOnTotalPrice, 'includedDiscounts'>;
};

type PriceGenerationProps = { gross?: number; net?: number; tax?: number };

type DiscountGenerationProps = { gross?: number; net?: number; amount: number };

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

const taxedPrice = ({
  gross = 0,
  net = 0,
  tax = 0,
}: PriceGenerationProps): TaxedPricePropsImportantForMappingTests => ({
  totalGross: centPrice(gross),
  totalNet: centPrice(net),
  totalTax: centPrice(tax),
});

const DEFAULT_EU_TAX_RATE = 0.19;

export const fullPriceData = (priceData: PriceGenerationProps) => ({
  taxedPrice: taxedPrice(priceData),
  totalPrice: centPrice(priceData.gross ?? 0),
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
  ...fullPriceData({}),
};

export const discountedLineitemWithTaxIncluded: LineItemPropsImportantForMappingTests =
  {
    ...giftLineItem,
    price: {
      value: centPrice(24875),
    },
    quantity: 1,
    lineItemMode: 'Standard',
    ...fullPriceData({ gross: 19900, net: 16723, tax: 3177 }),
  };

export const discountedLineItems = [
  giftLineItem,
  discountedLineitemWithTaxIncluded,
];

export const discountOnTotalPrice = ({
  gross,
  net,
  amount,
}: DiscountGenerationProps) => ({
  discountedAmount: centPrice(amount),
  discountedNetAmount: net ? centPrice(net) : undefined,
  discountedGrossAmount: gross ? centPrice(gross) : undefined,
});

const defaultRelevantForMappingCTCartParams = {
  priceRoundingMode: 'HalfEven',
  discountCodes: [],
  directDiscounts: [],
  taxMode: 'Platform',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
  locale: 'de',
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
      ...fullPriceData({ gross: 18599, net: 15629, tax: 2970 }),
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
      ...fullPriceData({ gross: 22133, net: 18599, tax: 3534 }),
    },
  ],
  ...fullPriceData({ gross: 35437, net: 29778, tax: 5659 }),
  shippingInfo: { taxedPrice: taxedPrice({}) },
  discountOnTotalPrice: discountOnTotalPrice({
    gross: 5295,
    net: 4836,
    amount: 4450,
  }),
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
        ...fullPriceData({ gross: 55797, net: 46887, tax: 8910 }),
      },
    ],
    ...fullPriceData({ gross: 48543, net: 40791, tax: 7752 }),
    discountOnTotalPrice: discountOnTotalPrice({
      gross: 7254,
      net: 6096,
      amount: 7254,
    }),
    taxCalculationMode: 'UnitPriceLevel',
  };

const generateLineItemProps = (
  referenceName: string,
  itemPrice: number,
  lineItemMode?: LineItemMode,
  taxRate = DEFAULT_EU_TAX_RATE
): RelevantQuantityIndependentLineItemProps => ({
  name: {
    en: `name${referenceName}`,
  },
  variant: { sku: `sku${referenceName}` },
  taxRate: { amount: taxRate },
  lineItemMode: lineItemMode ?? 'Standard',
  price: { value: centPrice(itemPrice) },
});

const testLineItemsBaseData = {
  //all test data are based on sandbox products, corresponding product can be found by name
  defaultItem: { ...generateLineItemProps('amanda gray', 22375) }, // default ct item type, included standard EU tax, no discounts
  doubleDiscountedItemWithGift: {
    ...generateLineItemProps('amanda brown', 23134), // this item forces the cart to get total discount
  },
  productDiscountItem: {
    ...generateLineItemProps('amanda black', 24376), //product discount is already included in product price and doesn't need to be mapped for PayPal separately
  },
  taxNotIncludedInBasePrice: {
    ...generateLineItemProps('amanda red', 19999), //tax is still included in total gross, so it influences only rounding on ct side
  },
};

export type LineItemGenerationData = PriceGenerationProps & {
  itemType: keyof typeof testLineItemsBaseData;
  quantity: number;
  lineItemMode?: LineItemMode;
};

type CartGenerationData = {
  lineItemsData: LineItemGenerationData[];
  cardPrice?: PriceGenerationProps;
  discount?: DiscountGenerationProps;
  customCardProps?: Partial<CartPropsImportantForMappingTests>;
};

export const lineItemFromLineItemData = ({
  itemType,
  quantity,
  gross,
  net,
  tax,
  lineItemMode,
}: LineItemGenerationData) => ({
  ...testLineItemsBaseData[itemType],
  lineItemMode: lineItemMode ?? 'Standard',
  quantity: quantity,
  ...fullPriceData({ gross, net, tax }),
});

export const cardFromCardData = ({
  lineItemsData,
  cardPrice,
  discount,
  customCardProps = {},
}: CartGenerationData) => ({
  ...defaultRelevantForMappingCTCartParams,
  lineItems: lineItemsData.map(lineItemFromLineItemData),
  ...fullPriceData(cardPrice ?? lineItemsData[0]),
  discountOnTotalPrice: discount ? discountOnTotalPrice(discount) : undefined,
  ...customCardProps,
});

const giftLineItemData: LineItemGenerationData = {
  gross: 0,
  net: 0,
  tax: 0,
  itemType: 'doubleDiscountedItemWithGift',
  quantity: 1,
  lineItemMode: 'GiftLineItem',
};

export const simpleCartsDataWithLineItemMode: CartGenerationData[] = [
  //"magic" numbers are extracted from sandbox commercetools products and cards
  {
    lineItemsData: [
      {
        gross: 22375,
        net: 18803,
        tax: 3572,
        itemType: 'defaultItem',
        quantity: 1,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 44750,
        net: 37605,
        tax: 7145,
        itemType: 'defaultItem',
        quantity: 2,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 67125,
        net: 56408,
        tax: 10717,
        itemType: 'defaultItem',
        quantity: 3,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 24376,
        net: 20484,
        tax: 3892,
        itemType: 'productDiscountItem',
        quantity: 1,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 48752,
        net: 40968,
        tax: 7784,
        itemType: 'productDiscountItem',
        quantity: 2,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 73128,
        net: 61452,
        tax: 11676,
        itemType: 'productDiscountItem',
        quantity: 3,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 27529,
        net: 23134,
        tax: 4395,
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 1,
      },
    ],
  },
  {
    lineItemsData: [
      {
        gross: 55059,
        net: 46268,
        tax: 8791,
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 2,
      },
    ],
  },

  {
    lineItemsData: [
      {
        gross: 82588,
        net: 69402,
        tax: 13186,
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 3,
      },
    ],
  },
];

export const simpleCartsDataWithUnitPriceMode: CartGenerationData[] = [
  {
    customCardProps: { taxCalculationMode: 'UnitPriceLevel' },
    lineItemsData: [
      {
        gross: 55058,
        net: 46268,
        tax: 8790,
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 2,
      },
    ],
  },
  {
    customCardProps: { taxCalculationMode: 'UnitPriceLevel' },
    lineItemsData: [
      {
        gross: 82587,
        net: 69402,
        tax: 13185,
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 3,
      },
    ],
  },
];

export const discountedCartsData: CartGenerationData[] = [
  {
    lineItemsData: [
      {
        gross: 23134,
        net: 19440,
        tax: 3694,
        itemType: 'doubleDiscountedItemWithGift',
        quantity: 1,
      },
      giftLineItemData,
    ],
    cardPrice: { gross: 20127, net: 16913, tax: 3214 },
    discount: { gross: 3007, net: 2527, amount: 3007 },
  },
  {
    lineItemsData: [
      {
        gross: 46268,
        net: 38881,
        tax: 7387,
        itemType: 'doubleDiscountedItemWithGift',
        quantity: 2,
      },
      giftLineItemData,
    ],
    cardPrice: { gross: 40253, net: 33826, tax: 6427 },
    discount: { gross: 6015, net: 5055, amount: 6015 },
  },
  {
    lineItemsData: [
      {
        gross: 69402,
        net: 58321,
        tax: 11081,
        itemType: 'doubleDiscountedItemWithGift',
        quantity: 3,
      },
      giftLineItemData,
    ],
    cardPrice: { gross: 60380, net: 50739, tax: 9641 },
    discount: { gross: 9022, net: 7582, amount: 9022 },
  },
];

export const shippedCarts: CartGenerationData[] = [
  {
    lineItemsData: [
      {
        itemType: 'doubleDiscountedItemWithGift',
        quantity: 1,
        gross: 23134,
        net: 19440,
        tax: 3694,
      },
      giftLineItemData,
      {
        itemType: 'taxNotIncludedInBasePrice',
        quantity: 3,
        gross: 82587,
        net: 69402,
        tax: 13185,
      },
    ],
    cardPrice: { net: 78023, gross: 92847, tax: 14824 },
    discount: { net: 11659, gross: 13874, amount: 12160 },
    customCardProps: {
      shippingInfo: {
        taxedPrice: taxedPrice({ gross: 1000, net: 840, tax: 160 }),
      },
      taxCalculationMode: 'UnitPriceLevel',
    },
  },
];
