import {
  Address,
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

type TestUpdateAction = { action: string; [key: string]: unknown };

type PaymentStateMapData = [string, TestUpdateAction[], boolean];

// Narrows to the subset of PaymentUpdateAction | CustomerUpdateAction that
// carries a name/value pair (e.g. setCustomField, setTransactionCustomField),
// so test assertions can read .name/.value without an `any` cast.
export const findActionByName = (actions: UpdateActions, name: string) =>
  actions.find(
    (action): action is Extract<UpdateActions[number], { name: string }> =>
      'name' in action && action.name === name
  );

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
  'name' | 'lineItemMode' | 'id'
> & {
  variant: Pick<ProductVariant, 'sku'>;
  taxRate?: Pick<TaxRate, 'amount'>;
  price: Pick<Price, 'value' | 'discounted'>;
};

type TaxedPricePropsImportantForMappingTests = Omit<TaxedPrice, 'taxPortions'>;

type LineItemPropsImportantForMappingTests =
  RelevantQuantityIndependentLineItemProps &
    Pick<LineItem, 'quantity' | 'totalPrice'> & {
      taxedPrice: TaxedPricePropsImportantForMappingTests;
    };

type ShippingInfoPropsImportantForMappingTests = {
  taxedPrice?: TaxedPricePropsImportantForMappingTests;
  price?: CentPrecisionMoney;
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
  | 'shippingMode'
  | 'shippingAddress'
> & {
  lineItems: LineItemPropsImportantForMappingTests[];
  taxedPrice: TaxedPricePropsImportantForMappingTests;
  shippingInfo?: ShippingInfoPropsImportantForMappingTests;
  discountOnTotalPrice?: Omit<DiscountOnTotalPrice, 'includedDiscounts'>;
  shipping?: {
    shippingInfo?: ShippingInfoPropsImportantForMappingTests;
    shippingKey: string;
    shippingAddress?: Address;
  }[];
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

export const discountOnTotalPrice = ({
  gross,
  net,
  amount,
}: DiscountGenerationProps) => ({
  discountedAmount: centPrice(amount),
  discountedNetAmount: net ? centPrice(net) : undefined,
  discountedGrossAmount: gross ? centPrice(gross) : undefined,
});

export const dummyAddress = (overrides: Partial<Address> = {}): Address => ({
  streetName: 'Main Street',
  streetNumber: '1',
  city: 'Berlin',
  postalCode: '10115',
  country: 'DE',
  firstName: 'Jane',
  lastName: 'Doe',
  ...overrides,
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

const generateLineItemProps = (
  itemPrice: number,
  referenceName?: string,
  dsicountedPrice?: number,
  lineItemMode?: LineItemMode
): RelevantQuantityIndependentLineItemProps => ({
  name: referenceName
    ? {
        en: `name${referenceName}`,
      }
    : {},
  id: `id${itemPrice}`,
  variant: { sku: `sku${referenceName}` },
  taxRate: { amount: DEFAULT_EU_TAX_RATE },
  lineItemMode: lineItemMode ?? 'Standard',
  price: {
    value: centPrice(itemPrice),
    discounted: dsicountedPrice
      ? {
          value: centPrice(dsicountedPrice),
          discount: {
            typeId: 'product-discount',
            id: 'irrelevantForMapping',
          },
        }
      : undefined,
  },
});

const testLineItemsBaseData: {
  [key: string]: RelevantQuantityIndependentLineItemProps;
} = {
  //all test data are based on sandbox products, corresponding product can be found by name
  defaultItem: { ...generateLineItemProps(22375, 'amanda gray') }, // default ct item type, included standard EU tax, no discounts
  doubleDiscountedItemWithGift: {
    ...generateLineItemProps(19999, 'amanda brown', 18599), // this item forces the cart to get total discount
  },
  giftLineItem: {
    ...generateLineItemProps(0, 'amanda brown', undefined, 'GiftLineItem'),
  }, //is automatically added to cart if at least one doubleDiscountedItemWithGift is present, if present quantity is 1 always, if removed once - will never reappear in this cart
  productDiscountItem: {
    ...generateLineItemProps(24376, 'amanda black'), //product discount is already included in product price and doesn't need to be mapped for PayPal separately
  },
  taxNotIncludedInBasePrice: {
    ...generateLineItemProps(19999, 'amanda red', 18599), //tax is still included in total gross, so it influences only rounding on ct side
  },
  //further line items data and carts using it are from sandbox project with totalPriceDiscountDoesNotReduceExternalTax true instead of old default false
  zeroPriceItem: { ...generateLineItemProps(0, 'allO') }, //has price directly set to 0, is not commercetools giftLineItem
  nameless: { ...generateLineItemProps(0) }, //commercetools name is empty object
  externalDiscounted: { ...generateLineItemProps(29900, 'external', 25415) },
};

const giftLineItemData: LineItemGenerationData = {
  itemType: 'giftLineItem',
  quantity: 1,
};

export type LineItemGenerationData = PriceGenerationProps & {
  itemType: keyof typeof testLineItemsBaseData;
  quantity: number;
  lineItemMode?: LineItemMode;
  totalPrice?: CentPrecisionMoney;
  shippingDetails?: {
    targets: { shippingMethodKey: string; quantity: number }[];
    valid: boolean;
  };
};

export type CartGenerationData = {
  lineItemsData: LineItemGenerationData[];
  cartPrice?: PriceGenerationProps;
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
  totalPrice,
  shippingDetails,
}: LineItemGenerationData) => ({
  ...testLineItemsBaseData[itemType],
  lineItemMode: lineItemMode ?? 'Standard',
  ...fullPriceData({ gross, net, tax }),
  quantity,
  totalPrice,
  shippingDetails,
});

type LineItemMapTestData = LineItemGenerationData & {
  testDescription: string;
  expectedUnitAmount?: number; //by default 0 is expected
  expectedTax?: number; // by default 0 is expected
};

const giftLineItem = {
  testDescription: 'gift line item',
  ...giftLineItemData,
};

const zeroCostItem = (quantity: number) => ({
  testDescription: `${quantity} item(s) that costs 0`,
  itemType: 'zeroPriceItem',
  quantity,
  expectedUnitAmount: 0,
  expectedTax: 0,
});

export type LineItemTestData = {
  [key: string]: LineItemMapTestData;
};

/* Gross/net price can differ from item price, because country specific rules were automatically applied by commercetools.
If gross/net is provided and positive - this is the actual amount commercetools expects customer to pay.*/
export const testLineItemsWithExpectationsLineItemMode: LineItemTestData = {
  singleDefault: {
    testDescription: 'single default item in default mode',
    itemType: 'defaultItem',
    quantity: 1,
    gross: 22375,
    net: 18803,
    tax: 3572,
    expectedUnitAmount: 22375,
  },
  singleWithCustomGross: {
    testDescription: 'single customized item with custom gross price',
    itemType: 'defaultItem',
    quantity: 1,
    gross: 223,
    net: 18803,
    tax: 3572,
    expectedUnitAmount: 223,
  },
  threeDefault: {
    testDescription: 'multiple default items in default mode',
    gross: 67125,
    net: 56408,
    tax: 10717,
    itemType: 'defaultItem',
    quantity: 3,
    expectedUnitAmount: 67125,
  },
  singleDoubleDiscounted: {
    testDescription:
      'single item with discounts on itself and cart level with a gift',
    itemType: 'doubleDiscountedItemWithGift',
    quantity: 1,
    gross: 22375,
    net: 18803,
    tax: 3572,
    expectedUnitAmount: 22375,
  },
  twoProductDiscounted: {
    testDescription: 'two items with only discount on itself',
    gross: 48752,
    net: 40968,
    tax: 7784,
    itemType: 'productDiscountItem',
    quantity: 2,
    expectedUnitAmount: 48752,
  },
  giftLineItem,
  threeTaxNotIncludedInBasePrice: {
    testDescription: 'three items with tax not included in base price',
    gross: 82588,
    net: 69402,
    tax: 13186,
    itemType: 'taxNotIncludedInBasePrice',
    quantity: 3,
    expectedUnitAmount: 82588,
  },
  zeroCostItem: zeroCostItem(1),
  nameless: {
    ...zeroCostItem(1),
    itemType: 'nameless',
    testDescription: 'no valid name provided',
  },
};

export const testLineItemsWithExpectationsUnitPriceMode: LineItemTestData = {
  tripleNotIncludedPrice: {
    testDescription: 'two items with tax not included in base price',
    gross: 82587,
    net: 69402,
    tax: 13185,
    itemType: 'taxNotIncludedInBasePrice',
    quantity: 3,
    expectedUnitAmount: 69402,
    expectedTax: 13185,
  },
  doubleDiscountedItem: {
    testDescription: 'double discounted item with gift',
    itemType: 'doubleDiscountedItemWithGift',
    quantity: 1,
    gross: 23134,
    net: 19440,
    tax: 3694,
    expectedUnitAmount: 19440,
    expectedTax: 3694,
  },
};

export const testLineItemsWithExpectationsExternalTax = {
  singleZeroCost: zeroCostItem(0),
  pluralZeroCost: zeroCostItem(9),
  singleExternalDiscounted: {
    testDescription: 'single item with discount and no gross available',
    itemType: 'externalDiscounted',
    quantity: 1,
    expectedUnitAmount: 25415,
    expectedTax: 0,
  },
};

export const cartFromCartData = ({
  lineItemsData,
  cartPrice,
  discount,
  customCardProps = {},
}: CartGenerationData) => ({
  ...defaultRelevantForMappingCTCartParams,
  lineItems: lineItemsData.map(lineItemFromLineItemData),
  ...fullPriceData(cartPrice ?? lineItemsData[0]),
  discountOnTotalPrice: discount ? discountOnTotalPrice(discount) : undefined,
  ...customCardProps,
});

type CartTestData = {
  cartData: CartGenerationData;
  testDescription: string;
  expectedDiscount?: number;
  expectedShipping?: number;
  expectedTax?: number;
};

export const singleLineItemTypeCartsDataWithMatchingTotal: CartTestData[] = [
  ...Object.values(testLineItemsWithExpectationsLineItemMode),
  ...Object.values(testLineItemsWithExpectationsUnitPriceMode),
  testLineItemsWithExpectationsExternalTax.singleZeroCost,
  testLineItemsWithExpectationsExternalTax.pluralZeroCost,
].map((value) => ({
  testDescription: value.testDescription,
  cartData: { lineItemsData: [value] },
}));

export const complexCartsData: CartTestData[] = [
  {
    cartData: {
      lineItemsData: [
        testLineItemsWithExpectationsUnitPriceMode.doubleDiscountedItem,
        giftLineItem,
      ],
      cartPrice: { gross: 20127, net: 16913, tax: 3214 },
      discount: { gross: 3007, net: 2527, amount: 3007 },
    },
    testDescription: 'item with two discounts and gift',
    expectedDiscount: 3007,
  },
  {
    cartData: {
      lineItemsData: [
        {
          itemType: 'doubleDiscountedItemWithGift',
          gross: 18599,
          net: 18599,
          tax: 0,
          quantity: 1,
        },
        giftLineItem,
      ],
      discount: { amount: 2418 },
      customCardProps: {
        taxCalculationMode: 'UnitPriceLevel',
        totalPrice: centPrice(16181),
      },
    },
    testDescription:
      'item with two discounts and gift with unit price level set on cart',
    expectedDiscount: 2418,
    expectedTax: 0,
  },
  {
    cartData: {
      lineItemsData: [
        {
          itemType: 'taxNotIncludedInBasePrice',
          quantity: 3,
          totalPrice: centPrice(55797),
        },
        {
          itemType: 'doubleDiscountedItemWithGift',
          quantity: 1,
          totalPrice: centPrice(18599),
        },
        giftLineItem,
      ],
      cartPrice: {},
      discount: { amount: 9671 },
      customCardProps: { totalPrice: centPrice(64725) },
    },
    testDescription:
      'item with two discounts and gift and item with external tax',
    expectedDiscount: 9671,
  },
  {
    testDescription: 'two items with a gift and cart discount',
    cartData: {
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
      cartPrice: { gross: 40253, net: 33826, tax: 6427 },
      discount: { gross: 6015, net: 5055, amount: 6015 },
    },
    expectedDiscount: 6015,
  },
  {
    testDescription: 'threee items with a gift and cart discount',
    cartData: {
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
      cartPrice: { gross: 60380, net: 50739, tax: 9641 },
      discount: { gross: 9022, net: 7582, amount: 9022 },
    },
    expectedDiscount: 9022,
  },
  {
    testDescription: 'external amount tax with discount',
    cartData: {
      lineItemsData: [
        testLineItemsWithExpectationsExternalTax.singleExternalDiscounted,
      ],
      discount: { amount: 2262 },
      customCardProps: {
        taxMode: 'ExternalAmount',
        taxCalculationMode: 'LineItemLevel',
        totalPrice: centPrice(73153),
        shippingInfo: { price: centPrice(50000) },
      },
    },
    expectedDiscount: 2262,
    expectedShipping: 50000,
  },
  {
    cartData: {
      lineItemsData: [
        testLineItemsWithExpectationsUnitPriceMode.doubleDiscountedItem,
        giftLineItem,
        testLineItemsWithExpectationsUnitPriceMode.tripleNotIncludedPrice,
      ],
      cartPrice: { net: 78023, gross: 92847, tax: 14824 },
      discount: { net: 11659, gross: 13874, amount: 12160 },
      customCardProps: {
        shippingInfo: {
          taxedPrice: taxedPrice({ gross: 1000, net: 840, tax: 160 }),
        },
        taxCalculationMode: 'UnitPriceLevel',
      },
    },
    testDescription: 'multiple different items in unit price level',
    expectedDiscount: 13874,
    expectedShipping: 1000,
    expectedTax: 16879,
  },
];

const multiShippingCartDataWithShippingDiscount: CartGenerationData = {
  lineItemsData: [
    {
      itemType: 'productDiscountItem',
      quantity: 1,
      gross: 24376,
      net: 20484,
      tax: 3892,
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
  ],
  cartPrice: { gross: 25855 },
  customCardProps: {
    shippingMode: 'Multiple',
    shipping: [
      {
        shippingInfo: {
          price: centPrice(1700),
          taxedPrice: taxedPrice({ gross: 1479, net: 1409, tax: 70 }),
        },
        shippingKey: 'dummyShippingMethod',
      },
    ],
  },
};

const multiShippingCartDataWithTwoMethods: CartGenerationData = {
  lineItemsData: [
    {
      itemType: 'defaultItem',
      quantity: 1,
      gross: 212958,
      net: 178956,
      tax: 34002,
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
    {
      itemType: 'defaultItem',
      quantity: 1,
      gross: 93842,
      net: 78859,
      tax: 14983,
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod2' }],
        valid: true,
      },
    },
  ],
  cartPrice: { gross: 316600, net: 266051, tax: 50549 },
  customCardProps: {
    shippingMode: 'Multiple',
    shipping: [
      {
        shippingInfo: {
          price: centPrice(4900),
          taxedPrice: taxedPrice({ gross: 4900, net: 4118, tax: 782 }),
        },
        shippingKey: 'dummyShippingMethod',
      },
      {
        shippingInfo: {
          price: centPrice(4900),
          taxedPrice: taxedPrice({ gross: 4900, net: 4118, tax: 782 }),
        },
        shippingKey: 'dummyShippingMethod2',
      },
    ],
  },
};

const multiShippingCartDataWithDiscountAndGift: CartGenerationData = {
  lineItemsData: [
    {
      itemType: 'defaultItem',
      quantity: 1,
      gross: 22375,
      net: 18803,
      tax: 3572,
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
    {
      itemType: 'taxNotIncludedInBasePrice',
      quantity: 1,
      totalPrice: centPrice(23134),
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
    {
      itemType: 'doubleDiscountedItemWithGift',
      quantity: 1,
      gross: 23134,
      net: 19440,
      tax: 3694,
      shippingDetails: {
        targets: [{ quantity: 1, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
    { itemType: 'giftLineItem', quantity: 1 },
    {
      itemType: 'productDiscountItem',
      quantity: 3,
      gross: 73128,
      net: 61452,
      tax: 11676,
      shippingDetails: {
        targets: [{ quantity: 3, shippingMethodKey: 'dummyShippingMethod' }],
        valid: true,
      },
    },
  ],
  cartPrice: { gross: 124098 },
  discount: { amount: 18543 },
  customCardProps: {
    shippingMode: 'Multiple',
    shipping: [
      {
        shippingInfo: {
          price: centPrice(1000),
          taxedPrice: taxedPrice({ gross: 870, net: 731, tax: 139 }),
        },
        shippingKey: 'dummyShippingMethod',
      },
      {
        shippingInfo: {
          price: centPrice(0),
          taxedPrice: taxedPrice({ gross: 0, net: 0, tax: 0 }),
        },
        shippingKey: 'dummyShippingMethod2',
      },
      {
        shippingInfo: {
          price: centPrice(0),
          taxedPrice: taxedPrice({ gross: 0, net: 0, tax: 0 }),
        },
        shippingKey: 'dummyShippingMethod3',
      },
    ],
  },
};

export const multiShippingData: CartTestData[] = [
  {
    cartData: multiShippingCartDataWithShippingDiscount,
    testDescription: 'shipping discount depending on total',
    expectedShipping: 1479,
  },
  {
    cartData: multiShippingCartDataWithTwoMethods,
    testDescription: 'two identical shipping',
    expectedShipping: 9800,
  },
  {
    cartData: multiShippingCartDataWithDiscountAndGift,
    testDescription:
      'three shipping entries with discounted shipping, gift and cart discount',
    expectedShipping: 870,
    expectedDiscount: 18543,
  },
];
