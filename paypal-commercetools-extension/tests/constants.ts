import {
  Cart,
  CentPrecisionMoney,
  LineItem,
  ProductVariant,
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

const variant: ProductVariant = {
  id: 1,
  sku: 'A0E2000000024BC',
  key: 'A0E2000000024BC',
  prices: [
    {
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
    {
      id: '0e6337f9-3b87-409b-bbbd-08ce7d1f2c32',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 16311,
        fractionDigits: 2,
      },
      customerGroup: {
        typeId: 'customer-group',
        id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 13049,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'b3fcf92e-c531-44f4-a9be-c1ca2712a70b',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 24875,
        fractionDigits: 2,
      },
      country: 'US',
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 19900,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '880a738c-3100-4fa7-a282-a9d8f6d3d087',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 16311,
        fractionDigits: 2,
      },
      customerGroup: {
        typeId: 'customer-group',
        id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 13049,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '0d623977-dc7e-4e16-9690-dea4121274ee',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19900,
        fractionDigits: 2,
      },
      country: 'DE',
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15920,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'ed6ef422-c924-4f48-a694-b688a3d6b3d1',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19900,
        fractionDigits: 2,
      },
      country: 'IT',
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15920,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'f23a1614-7aaa-4347-b603-880d47c6faa9',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19900,
        fractionDigits: 2,
      },
      country: 'GB',
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15920,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '22cce88d-c70b-4ef0-a18c-4e50218906e8',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19701,
        fractionDigits: 2,
      },
      country: 'DE',
      channel: {
        typeId: 'channel',
        id: '75df37ab-63e1-4249-bfc0-646147e2ffa6',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15761,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '30bb5e2c-7579-43a7-93de-ae52e110998b',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 26368,
        fractionDigits: 2,
      },
      channel: {
        typeId: 'channel',
        id: 'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 21094,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'ef440b1e-fafc-4f7a-94e6-add196a5a8da',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 18109,
        fractionDigits: 2,
      },
      country: 'DE',
      channel: {
        typeId: 'channel',
        id: '3fda21ca-eaf9-457b-a1ff-245ea04ada46',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 14487,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '4bc44446-3e73-4190-a3e4-00911f25c70b',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19104,
        fractionDigits: 2,
      },
      country: 'DE',
      channel: {
        typeId: 'channel',
        id: 'c6da9eb2-3b00-4b18-9a5f-98d506f31559',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15283,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '8036b72c-3eb6-4a71-8035-906def1a5be6',
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 19104,
        fractionDigits: 2,
      },
      country: 'DE',
      channel: {
        typeId: 'channel',
        id: '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 15283,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '130956aa-f059-4846-980a-871c682d51d0',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 19701,
        fractionDigits: 2,
      },
      country: 'US',
      channel: {
        typeId: 'channel',
        id: '49cc945c-0b28-43a2-aa6a-1a4430a17b61',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 15761,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '811e294b-6210-4ef6-b902-637a22e52631',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 26368,
        fractionDigits: 2,
      },
      channel: {
        typeId: 'channel',
        id: '62dda080-6c85-4df0-ae54-a1519314372e',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 21094,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: '69f85145-36f1-4207-99da-0d85eb89cedb',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 18109,
        fractionDigits: 2,
      },
      country: 'US',
      channel: {
        typeId: 'channel',
        id: 'aa530361-457b-4473-a0ed-894c23b2d5bb',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 14487,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'e230b443-2c2f-4e0a-985b-b59dd7f2c91e',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 19104,
        fractionDigits: 2,
      },
      country: 'US',
      channel: {
        typeId: 'channel',
        id: 'ccdbf75a-1fa0-4b3c-b676-ef379c22ee5d',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 15283,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
    {
      id: 'f72d2d9a-980a-4d96-9bb7-40d2ca6217c2',
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 19104,
        fractionDigits: 2,
      },
      country: 'US',
      channel: {
        typeId: 'channel',
        id: '546c73e4-e350-452a-91e7-1118d4759cad',
      },
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 15283,
          fractionDigits: 2,
        },
        discount: {
          typeId: 'product-discount',
          id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
        },
      },
    },
  ],
  images: [
    {
      url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/080736_1_medium.jpg',
      dimensions: {
        w: 0,
        h: 0,
      },
    },
  ],
  attributes: [
    {
      name: 'articleNumberManufacturer',
      value: 'AMANDAB DOUBLE CARAMEL',
    },
    {
      name: 'articleNumberMax',
      value: '80736',
    },
    {
      name: 'matrixId',
      value: 'A0E2000000024BC',
    },
    {
      name: 'baseId',
      value: '80736',
    },
    {
      name: 'designer',
      value: {
        key: 'liebeskindberlin',
        label: 'Liebeskind Berlin',
      },
    },
    {
      name: 'madeInItaly',
      value: {
        key: 'no',
        label: 'no',
      },
    },
    {
      name: 'commonSize',
      value: {
        key: 'oneSize',
        label: 'one Size',
      },
    },
    {
      name: 'size',
      value: 'one size',
    },
    {
      name: 'color',
      value: {
        key: 'brown',
        label: {
          it: 'marrone',
          de: 'braun',
          en: 'brown',
        },
      },
    },
    {
      name: 'colorFreeDefinition',
      value: {
        en: 'brown',
        de: 'braun',
      },
    },
    {
      name: 'style',
      value: {
        key: 'sporty',
        label: 'sporty',
      },
    },
    {
      name: 'gender',
      value: {
        key: 'women',
        label: 'Damen',
      },
    },
    {
      name: 'season',
      value: 's15',
    },
    {
      name: 'isOnStock',
      value: true,
    },
  ],
  assets: [],
  availability: {
    isOnStock: true,
    availableQuantity: 8,
    version: 1,
    id: '5f39791f-b1e2-4789-9d10-73480b0e5f74',
    channels: {
      '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb': {
        isOnStock: true,
        availableQuantity: 6,
        version: 1,
        id: '7587acdb-4d17-4f7e-8fb8-3c55eeeb8cce',
      },
      'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac': {
        isOnStock: true,
        availableQuantity: 2,
        version: 1,
        id: '073f273c-cb94-461d-a83f-6eb60ff5d1b5',
      },
      'c6da9eb2-3b00-4b18-9a5f-98d506f31559': {
        isOnStock: true,
        availableQuantity: 77,
        version: 1,
        id: 'b896e905-4b2e-43c3-99b4-1736e139fc24',
      },
      '75df37ab-63e1-4249-bfc0-646147e2ffa6': {
        isOnStock: true,
        availableQuantity: 8,
        version: 1,
        id: '6f6e6477-8334-492e-ad88-b3c4e980bd8d',
      },
      '3fda21ca-eaf9-457b-a1ff-245ea04ada46': {
        isOnStock: true,
        availableQuantity: 9,
        version: 1,
        id: 'b6c48ab7-5d01-4fed-ad5b-ed761eb9c199',
      },
    },
  },
};

export const discountedLineItems: LineItem[] = [
  {
    id: '45e9ee9f-9d6b-4e01-934b-b794cc303995',
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
    variant,
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
  },
  {
    id: 'cfb73a1a-3884-4e01-b435-dce4c5ebea79',
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
    variant,
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
    addedAt: '2024-12-05T13:45:55.939Z',
    lastModifiedAt: '2024-12-05T13:45:55.939Z',
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
  },
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
        prices: [
          {
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
                centAmount: 23134,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '0e6337f9-3b87-409b-bbbd-08ce7d1f2c32',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 16311,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 15169,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'b3fcf92e-c531-44f4-a9be-c1ca2712a70b',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24875,
              fractionDigits: 2,
            },
            country: 'US',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 23134,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '880a738c-3100-4fa7-a282-a9d8f6d3d087',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 16311,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 15169,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
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
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'ed6ef422-c924-4f48-a694-b688a3d6b3d1',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'IT',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'f23a1614-7aaa-4347-b603-880d47c6faa9',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'GB',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '22cce88d-c70b-4ef0-a18c-4e50218906e8',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19701,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '75df37ab-63e1-4249-bfc0-646147e2ffa6',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18322,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '30bb5e2c-7579-43a7-93de-ae52e110998b',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26368,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 24522,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'ef440b1e-fafc-4f7a-94e6-add196a5a8da',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 18109,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '3fda21ca-eaf9-457b-a1ff-245ea04ada46',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 16841,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '4bc44446-3e73-4190-a3e4-00911f25c70b',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19104,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c6da9eb2-3b00-4b18-9a5f-98d506f31559',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 17767,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '8036b72c-3eb6-4a71-8035-906def1a5be6',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19104,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 17767,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '130956aa-f059-4846-980a-871c682d51d0',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 19701,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '49cc945c-0b28-43a2-aa6a-1a4430a17b61',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 18322,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '811e294b-6210-4ef6-b902-637a22e52631',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 26368,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '62dda080-6c85-4df0-ae54-a1519314372e',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 24522,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: '69f85145-36f1-4207-99da-0d85eb89cedb',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 18109,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'aa530361-457b-4473-a0ed-894c23b2d5bb',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 16841,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'e230b443-2c2f-4e0a-985b-b59dd7f2c91e',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 19104,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'ccdbf75a-1fa0-4b3c-b676-ef379c22ee5d',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 17767,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
          {
            id: 'f72d2d9a-980a-4d96-9bb7-40d2ca6217c2',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 19104,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '546c73e4-e350-452a-91e7-1118d4759cad',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 17767,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
              },
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/080736_1_medium.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          {
            name: 'articleNumberManufacturer',
            value: 'AMANDAB DOUBLE CARAMEL',
          },
          { name: 'articleNumberMax', value: '80736' },
          { name: 'matrixId', value: 'A0E2000000024BC' },
          { name: 'baseId', value: '80736' },
          {
            name: 'designer',
            value: { key: 'liebeskindberlin', label: 'Liebeskind Berlin' },
          },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
          { name: 'size', value: 'one size' },
          {
            name: 'color',
            value: {
              key: 'brown',
              label: { it: 'marrone', de: 'braun', en: 'brown' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'brown', de: 'braun' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'women', label: 'Damen' } },
          { name: 'season', value: 's15' },
          { name: 'isOnStock', value: true },
        ],
        assets: [],
        availability: {
          isOnStock: true,
          availableQuantity: 1,
          version: 7,
          id: '5f39791f-b1e2-4789-9d10-73480b0e5f74',
          channels: {
            '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb': {
              isOnStock: true,
              availableQuantity: 6,
              version: 1,
              id: '7587acdb-4d17-4f7e-8fb8-3c55eeeb8cce',
            },
            'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac': {
              isOnStock: true,
              availableQuantity: 2,
              version: 1,
              id: '073f273c-cb94-461d-a83f-6eb60ff5d1b5',
            },
            'c6da9eb2-3b00-4b18-9a5f-98d506f31559': {
              isOnStock: true,
              availableQuantity: 77,
              version: 1,
              id: 'b896e905-4b2e-43c3-99b4-1736e139fc24',
            },
            '75df37ab-63e1-4249-bfc0-646147e2ffa6': {
              isOnStock: true,
              availableQuantity: 8,
              version: 1,
              id: '6f6e6477-8334-492e-ad88-b3c4e980bd8d',
            },
            '3fda21ca-eaf9-457b-a1ff-245ea04ada46': {
              isOnStock: true,
              availableQuantity: 9,
              version: 1,
              id: 'b6c48ab7-5d01-4fed-ad5b-ed761eb9c199',
            },
          },
        },
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
          discount: {
            typeId: 'product-discount',
            id: 'b63ef66f-809f-4959-b72b-7cb449cfc259',
          },
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
        prices: [
          {
            id: '9483cddb-e839-4ea3-bfa1-d1597ab4222e',
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
                centAmount: 23134,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '2042442e-f9e6-4534-be9b-408693c3caa2',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 16311,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 15169,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '76fd2f31-d2b0-49cf-90c8-95a0f95fae7f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24875,
              fractionDigits: 2,
            },
            country: 'US',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 23134,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '527854bd-3020-4434-821e-05f38bde6e40',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 16311,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '32dd73b0-57bc-4742-b0cf-e2ba2ca72ecc',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 15169,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
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
          {
            id: '0d77b0a7-0fb7-4e11-9acb-97fdad8e0b47',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'IT',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '9c6e806a-c2b6-42cd-8958-9eb0ad21e5cb',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'GB',
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: 'd13aef5b-6058-4f6f-a6ec-156749a5a69a',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '75df37ab-63e1-4249-bfc0-646147e2ffa6',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: 'e53e591c-60de-4889-b8a2-8899e474a68d',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 22885,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 21283,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '47d51d7c-533d-45ed-8d67-9505b8be68b1',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 20497,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '3fda21ca-eaf9-457b-a1ff-245ea04ada46',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 19062,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '99513125-d581-4cd4-ab09-6c3faec97e9b',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 20497,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c6da9eb2-3b00-4b18-9a5f-98d506f31559',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 19062,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '691e4b6b-d280-4b8b-8afd-4de445eb2701',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 21492,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 19988,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: 'eb463861-35bf-4b49-b161-25c48afd4efe',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 19900,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '49cc945c-0b28-43a2-aa6a-1a4430a17b61',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 18507,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '903b80b0-4465-4f6c-b05d-6fb27f505d4d',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 22885,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '62dda080-6c85-4df0-ae54-a1519314372e',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 21283,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: 'b3e0469e-0e5d-402a-969e-0309d13f1205',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 20497,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'aa530361-457b-4473-a0ed-894c23b2d5bb',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 19062,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: 'f12be887-e15d-4f3c-8843-31d8c5f7cc1a',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 20497,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'ccdbf75a-1fa0-4b3c-b676-ef379c22ee5d',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 19062,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
          {
            id: '593271ce-4d67-4085-8ead-834eae6687d1',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 21492,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '546c73e4-e350-452a-91e7-1118d4759cad',
            },
            discounted: {
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 19988,
                fractionDigits: 2,
              },
              discount: {
                typeId: 'product-discount',
                id: 'aef33a28-eb9a-46e8-b68b-7fc1c6d01830',
              },
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/080737_1_medium.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          { name: 'articleNumberManufacturer', value: 'AMANDAB DOUBLE POWDER' },
          { name: 'articleNumberMax', value: '80737' },
          { name: 'matrixId', value: 'A0E2000000024BD' },
          { name: 'baseId', value: '80737' },
          {
            name: 'designer',
            value: { key: 'liebeskindberlin', label: 'Liebeskind Berlin' },
          },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
          { name: 'size', value: 'one size' },
          {
            name: 'color',
            value: { key: 'red', label: { it: 'rosso', en: 'red', de: 'rot' } },
          },
          { name: 'colorFreeDefinition', value: { en: 'red', de: 'rot' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'women', label: 'Damen' } },
          { name: 'season', value: 's15' },
          { name: 'isOnStock', value: true },
        ],
        assets: [],
        availability: {
          isOnStock: true,
          availableQuantity: 132,
          version: 1,
          id: '54d7bdf1-752c-4299-8180-2a68bceb0f8b',
          channels: {
            '25d0dcd5-0b95-4999-8bce-fc12ddbdd8bb': {
              isOnStock: true,
              availableQuantity: 5,
              version: 1,
              id: '121f7e59-53ec-40b3-b4a3-304f15f1f814',
            },
            'c7d9ead6-f8e3-4783-a53c-83fe2cb0ccac': {
              isOnStock: true,
              availableQuantity: 10,
              version: 1,
              id: 'ff127226-c33c-47b0-a5ff-1bd6bf0ac9c3',
            },
            'c6da9eb2-3b00-4b18-9a5f-98d506f31559': {
              isOnStock: true,
              availableQuantity: 5,
              version: 1,
              id: '720f7f8c-ca2f-448a-a1d1-8d9068c5d642',
            },
            '75df37ab-63e1-4249-bfc0-646147e2ffa6': {
              isOnStock: true,
              availableQuantity: 132,
              version: 1,
              id: '7325f0ae-5dec-4226-8869-5dd6a07d518a',
            },
            '3fda21ca-eaf9-457b-a1ff-245ea04ada46': {
              isOnStock: true,
              availableQuantity: 681,
              version: 1,
              id: '792487a9-17aa-4016-b7c7-c122e9e7ff57',
            },
          },
        },
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
