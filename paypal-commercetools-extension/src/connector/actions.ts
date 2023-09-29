import {
  FieldDefinition,
  TypeAddFieldDefinitionAction,
  TypeDraft,
} from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const PAYPAL_PAYMENT_EXTENSION_KEY = 'paypal-payment-extension';
const PAYPAL_PAYMENT_TYPE_KEY = 'paypal-payment-type';
export const PAYPAL_PAYMENT_INTERACTION_TYPE_KEY =
  'paypal-payment-interaction-type';
export const PAYPAL_API_PAYMENT_ENDPOINTS = [
  'createPayPalOrder',
  'getClientToken',
  'capturePayPalOrder',
];

export async function createPaymentUpdateExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${PAYPAL_PAYMENT_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: PAYPAL_PAYMENT_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }

  await apiRoot
    .extensions()
    .post({
      body: {
        key: PAYPAL_PAYMENT_EXTENSION_KEY,
        timeoutInMs: 10000,
        destination: {
          type: 'HTTP',
          url: applicationUrl,
        },
        triggers: [
          {
            resourceTypeId: 'payment',
            actions: ['Update'],
            condition: mapEndpointsToCondition(PAYPAL_API_PAYMENT_ENDPOINTS),
          },
        ],
      },
    })
    .execute();
}

export async function deletePaymentUpdateExtension(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${PAYPAL_PAYMENT_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: PAYPAL_PAYMENT_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}

export async function createCustomPaymentType(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const fieldDefinitions: FieldDefinition[] = [];
  PAYPAL_API_PAYMENT_ENDPOINTS.forEach((element) =>
    fieldDefinitions.push(
      {
        name: `${element}Request`,
        label: {
          en: `${element}Request`,
        },
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
        required: false,
      },
      {
        name: `${element}Response`,
        label: {
          en: `${element}Response`,
        },
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
        required: false,
      }
    )
  );
  const customType = {
    key: PAYPAL_PAYMENT_TYPE_KEY,
    name: {
      en: 'Custom payment type to PayPal fields',
    },
    resourceTypeIds: ['payment'],
    fieldDefinitions: fieldDefinitions,
  };
  await addOrUpdateCustomType(apiRoot, customType);
}

async function addOrUpdateCustomType(
  apiRoot: ByProjectKeyRequestBuilder,
  customType: TypeDraft
): Promise<void> {
  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `key = "${customType.key}"`,
      },
    })
    .execute();
  if (types.length > 0) {
    const type = types[0];
    const updates = (customType.fieldDefinitions ?? [])
      .filter(
        (newFieldDefinition: FieldDefinition): boolean =>
          !type.fieldDefinitions.find(
            (existingFieldDefinition: FieldDefinition): boolean =>
              newFieldDefinition.name === existingFieldDefinition.name
          )
      )
      .map((fieldDefinition: FieldDefinition): TypeAddFieldDefinitionAction => {
        return {
          action: 'addFieldDefinition',
          fieldDefinition: fieldDefinition,
        };
      });
    if (updates.length === 0) {
      return;
    }
    await apiRoot
      .types()
      .withKey({ key: customType.key })
      .post({
        body: {
          version: type.version,
          actions: updates,
        },
      })
      .execute();
    return;
  }
  await apiRoot
    .types()
    .post({
      body: customType,
    })
    .execute();
}

function mapEndpointsToCondition(endpoints: string[]) {
  return (
    'custom is defined AND custom(fields is defined) AND (' +
    endpoints
      .map((endpoint) => `custom(fields(${endpoint}Request is defined))`)
      .join(' or ') +
    ')'
  );
}

export async function createCustomPaymentInteractionType(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const fieldDefinitions: FieldDefinition[] = [
    {
      name: 'type',
      label: {
        en: 'type',
      },
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
      required: false,
    },
    {
      name: 'data',
      label: {
        en: 'data',
      },
      type: {
        name: 'String',
      },
      inputHint: 'MultiLine',
      required: false,
    },
    {
      name: 'timestamp',
      label: {
        en: 'timestamp',
      },
      type: {
        name: 'DateTime',
      },
      required: false,
    },
  ];
  const customType = {
    key: PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
    name: {
      en: 'Custom payment interaction type to PayPal fields',
    },
    resourceTypeIds: ['payment-interface-interaction'],
    fieldDefinitions: fieldDefinitions,
  };
  await addOrUpdateCustomType(apiRoot, customType);
}
