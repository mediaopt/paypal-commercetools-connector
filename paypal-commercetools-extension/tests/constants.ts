import {
  Cart,
  CentPrecisionMoney,
  LineItem,
  ProductDiscountReference,
} from '@commercetools/platform-sdk';

const currencyData: Omit<CentPrecisionMoney, 'centAmount'> = {
  type: 'centPrecision',
  currencyCode: 'EUR',
  fractionDigits: 2,
};

const taxedPrice = {
  totalNet: {
    ...currencyData,
    centAmount: 16303,
  },
  totalGross: {
    ...currencyData,
    centAmount: 19400,
  },
  totalTax: {
    ...currencyData,
    centAmount: 3097,
  },
};

export const prices = {
  totalPrice: {
    ...currencyData,
    centAmount: 19400,
  },
  taxedPrice,
};

const total0: CentPrecisionMoney = {
  ...currencyData,
  centAmount: 0,
};

const total5Eur = {
  ...currencyData,
  centAmount: 500,
};

const discountProductPercent: ProductDiscountReference = {
  typeId: 'product-discount',
  id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
};

type LineItemWithoutPriceDetails = Omit<
  LineItem,
  | 'price'
  | 'id'
  | 'quantity'
  | 'totalPrice'
  | 'discountedPricePerQuantity'
  | 'taxedPricePortions'
  | 'lineItemMode'
>;

const discountedProductWithTaxIncluded: LineItemWithoutPriceDetails = {
  productId: '47708631-7f05-4881-8d9b-9563c567f1e3',
  productKey: '80736',
  name: {
    en: 'Bag ”Amanda B” Liebeskind brown',
    de: 'Tasche „Amanda B” Liebeskind braun',
  },
  productType: {
    typeId: 'product-type',
    id: '5caccab5-9af3-461f-9643-ee5870e9ea10',
  },
  productSlug: {
    en: 'liebeskind-bag-amanda-b-brown',
    de: 'liebeskind-tasche-amanda-b-braun',
  },
  variant: {
    id: 1,
    sku: 'A0E2000000024BC',
    key: 'A0E2000000024BC',
  },
  taxRate: {
    name: '19% incl.',
    amount: 0.19,
    includedInPrice: true,
    country: 'DE',
    id: 'ztfE6U8r',
    subRates: [],
  },
  perMethodTaxRate: [],
  addedAt: '2024-12-05T13:45:51.792Z',
  lastModifiedAt: '2024-12-05T13:45:51.792Z',
  state: [
    {
      quantity: 1,
      state: {
        typeId: 'state',
        id: '7a8d376f-4298-48ca-b442-df93bae0978e',
      },
    },
  ],
  priceMode: 'Platform',
};

const giftLineItem: LineItem = {
  id: '45e9ee9f-9d6b-4e01-934b-b794cc303995',
  ...discountedProductWithTaxIncluded,
  price: {
    id: '3a828cda-165c-4a67-b610-19cb8339fe98',
    value: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 24875,
      fractionDigits: 2,
    },
    discounted: {
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19900,
        fractionDigits: 2,
      },
      discount: {
        typeId: 'product-discount',
        id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
      },
    },
  },
  quantity: 1,
  discountedPricePerQuantity: [
    {
      quantity: 1,
      discountedPrice: {
        value: total0,
        includedDiscounts: [
          {
            discount: {
              typeId: 'cart-discount',
              id: '9d8110ff-037b-4c5a-b7ec-cce61dd6f598',
            },
            discountedAmount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
          },
        ],
      },
    },
  ],
  lineItemMode: 'GiftLineItem',
  totalPrice: total0,
  taxedPrice: {
    totalNet: total0,
    totalGross: total0,
    taxPortions: [
      {
        rate: 0.19,
        amount: total0,
        name: '19% incl.',
      },
    ],
    totalTax: total0,
  },
  taxedPricePortions: [],
};

export const discountedLineitemWithTaxIncluded: LineItem = {
  id: 'cfb73a1a-3884-4e01-b435-dce4c5ebea79',
  ...discountedProductWithTaxIncluded,
  price: {
    id: '3a828cda-165c-4a67-b610-19cb8339fe98',
    value: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 24875,
      fractionDigits: 2,
    },
    discounted: {
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19900,
        fractionDigits: 2,
      },
      discount: discountProductPercent,
    },
  },
  quantity: 1,
  discountedPricePerQuantity: [],
  lineItemMode: 'Standard',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 19900,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 16723,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 19900,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 3177,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 3177,
      fractionDigits: 2,
    },
  },
  taxedPricePortions: [],
};

export const discountedLineItems: LineItem[] = [
  giftLineItem,
  discountedLineitemWithTaxIncluded,
];

export const discountOnTotalPrice = {
  discountedAmount: total5Eur,
  includedDiscounts: [
    {
      discount: {
        typeId: 'cart-discount',
        id: 'c4b96843-e2ae-4c3c-987e-7c9819a13a40',
      },
      discountedAmount: total5Eur,
    },
  ],
  discountedNetAmount: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 420,
    fractionDigits: 2,
  },
  discountedGrossAmount: total5Eur,
};

export const cartWithExternalRate: Cart = {
  id: '0d675b6f-e026-4ff8-aa4f-69a7308d4a26',
  version: 270,
  createdAt: '2025-02-13T12:03:53.423Z',
  lastModifiedAt: '2025-02-17T10:09:40.474Z',
  lastModifiedBy: {
    clientId: 'seJiutIQQgFYw_vafgdcXCt5',
  },
  createdBy: { clientId: 'seJiutIQQgFYw_vafgdcXCt5' },
  customerEmail: 'asd@df.asd',
  anonymousId: '93d87ba5-01ea-4b30-04e3-599ef868cc59',
  locale: 'en',
  lineItems: [
    {
      id: 'fca9f426-8d97-4168-87df-63886abfbcb8',
      productId: '47708631-7f05-4881-8d9b-9563c567f1e3',
      productKey: '80736',
      name: {
        en: 'Bag ”Amanda B” Liebeskind brown',
        de: 'Tasche „Amanda B” Liebeskind braun',
      },
      productType: {
        typeId: 'product-type',
        id: '5caccab5-9af3-461f-9643-ee5870e9ea10',
      },
      productSlug: {
        en: 'liebeskind-bag-amanda-b-brown',
        de: 'liebeskind-tasche-amanda-b-braun',
      },
      variant: {
        id: 1,
        sku: 'A0E2000000024BC',
        key: 'A0E2000000024BC',
      },
      price: {
        id: '0d623977-dc7e-4e16-9690-dea4121274ee',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 19999,
          fractionDigits: 2,
        },
        country: 'DE',
        discounted: {
          value: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 18599,
            fractionDigits: 2,
          },
          discount: discountProductPercent,
        },
      },
      quantity: 1,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'ztfE6U8r',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2025-02-13T14:06:31.109Z',
      lastModifiedAt: '2025-02-13T14:06:31.109Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: '7a8d376f-4298-48ca-b442-df93bae0978e',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 18599,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15629,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 18599,
          fractionDigits: 2,
        },
        taxPortions: [
          {
            rate: 0.19,
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 2970,
              fractionDigits: 2,
            },
            name: '19% incl.',
          },
        ],
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 2970,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
    },
    {
      id: '700c548d-7300-4d04-86d8-e7208a469b55',
      productId: 'bf14fc2e-4e39-435d-a213-36a424540eb6',
      productKey: '80737',
      name: {
        en: 'Bag ”Amanda B” Liebeskind red',
        de: 'Tasche „Amanda B” Liebeskind rot',
      },
      productType: {
        typeId: 'product-type',
        id: '5caccab5-9af3-461f-9643-ee5870e9ea10',
      },
      productSlug: {
        en: 'liebeskind-bag-amanda-b-red',
        de: 'liebeskind-tasche-amanda-b-rot',
      },
      variant: {
        id: 1,
        sku: 'A0E2000000024BD',
        key: 'A0E2000000024BD',
      },
      price: {
        id: '8f4d5f07-6a94-4f9f-b578-697463d42078',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 19999,
          fractionDigits: 2,
        },
        country: 'DE',
        discounted: {
          value: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 18599,
            fractionDigits: 2,
          },
          discount: {
            typeId: 'product-discount',
            id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
          },
        },
      },
      quantity: 1,
      discountedPricePerQuantity: [],
      taxRate: {
        name: 'not-in-price-tax-category',
        amount: 0.19,
        includedInPrice: false,
        country: 'DE',
        id: 'qcBEaLs2',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2025-02-13T14:24:30.523Z',
      lastModifiedAt: '2025-02-13T14:24:30.523Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: '7a8d376f-4298-48ca-b442-df93bae0978e',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 18599,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 18599,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 22133,
          fractionDigits: 2,
        },
        taxPortions: [
          {
            rate: 0.19,
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 3534,
              fractionDigits: 2,
            },
            name: 'not-in-price-tax-category',
          },
        ],
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 3534,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
    },
  ],
  cartState: 'Active',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 32362,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 29778,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 35437,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 2970,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 3534,
          fractionDigits: 2,
        },
        name: 'not-in-price-tax-category',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 5659,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  taxedShippingPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
  },
  discountOnTotalPrice: {
    discountedAmount: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 4836,
      fractionDigits: 2,
    },
    includedDiscounts: [
      {
        discount: {
          typeId: 'cart-discount',
          id: 'c4b96843-e2ae-4c3c-987e-7c9819a13a40',
        },
        discountedAmount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4836,
          fractionDigits: 2,
        },
      },
    ],
    discountedNetAmount: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 4450,
      fractionDigits: 2,
    },
    discountedGrossAmount: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 5295,
      fractionDigits: 2,
    },
  },
  shippingMode: 'Single',
  shippingInfo: {
    shippingMethodName: 'Standard EU',
    price: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    shippingRate: {
      price: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      freeAbove: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 20000,
        fractionDigits: 2,
      },
      tiers: [],
    },
    taxRate: {
      name: '19% incl.',
      amount: 0.19,
      includedInPrice: true,
      country: 'DE',
      id: 'ztfE6U8r',
      subRates: [],
    },
    taxCategory: {
      typeId: 'tax-category',
      id: 'e10f3742-c379-4a27-be01-6529676bd542',
    },
    deliveries: [],
    shippingMethod: {
      typeId: 'shipping-method',
      id: '5eae0359-c347-4d51-b4ae-fba64a7d8221',
    },
    taxedPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      taxPortions: [
        {
          rate: 0.19,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 0,
            fractionDigits: 2,
          },
          name: '19% incl.',
        },
      ],
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
    },
    shippingMethodState: 'MatchesCart',
  },
  shippingAddress: {
    firstName: 'sad',
    lastName: 'asd',
    streetName: 'asd',
    streetNumber: 'asd',
    postalCode: '12345',
    city: 'asd',
    country: 'DE',
  },
  shipping: [],
  customLineItems: [],
  discountCodes: [],
  directDiscounts: [],
  paymentInfo: {
    payments: [
      { typeId: 'payment', id: 'd11c67e1-721d-4d95-a7c0-18f151cf4217' },
      { typeId: 'payment', id: '51f0b602-d4f2-4faf-a8c9-33b9900702f4' },
      { typeId: 'payment', id: '5c286d43-4760-4bd9-a76d-537b4eb792cc' },
      { typeId: 'payment', id: '175b6cb7-e469-4053-9bd4-40a397417a52' },
      { typeId: 'payment', id: 'bd374bda-999d-43a8-be0a-8e39694e3a85' },
      { typeId: 'payment', id: 'a5a0ebcd-7c65-432e-a438-15a71d35e552' },
      { typeId: 'payment', id: '1990ad61-079d-4990-8cca-9eda9bf47dea' },
      { typeId: 'payment', id: '70583c70-cec6-40e5-b882-f1656b73f23a' },
    ],
  },
  inventoryMode: 'ReserveOnOrder',
  taxMode: 'Platform',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
  deleteDaysAfterLastModification: 90,
  refusedGifts: [
    { typeId: 'cart-discount', id: '9d8110ff-037b-4c5a-b7ec-cce61dd6f598' },
  ],
  origin: 'Customer',
  billingAddress: {
    firstName: 'sad',
    lastName: 'asd',
    streetName: 'asd',
    streetNumber: 'asd',
    postalCode: '12345',
    city: 'asd',
    country: 'DE',
  },
  itemShippingAddresses: [],
  totalLineItemQuantity: 2,
};
