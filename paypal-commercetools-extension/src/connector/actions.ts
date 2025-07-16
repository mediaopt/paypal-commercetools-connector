import {
  ExtensionDraft,
  FieldDefinition,
  TypeAddFieldDefinitionAction,
  TypeDraft,
  TypeRemoveFieldDefinitionAction,
  TypeUpdateAction,
} from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import {
  CUSTOM_OBJECT_DEFAULT_VALUES,
  GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
  GRAPHQL_CUSTOMOBJECT_KEY_NAME,
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PAYMENT_TYPE_KEY,
} from '../constants';
import { findMatchingExtension } from '../service/commercetools.service';
import {
  deleteAccessToken,
  getCachedAccessToken,
} from '../service/config.service';
import { logger } from '../utils/logger.utils';
import { LocalizedString } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';

const PAYPAL_API_PAYMENT_ENDPOINTS = [
  'createPayPalOrder',
  'getClientToken',
  'authorizePayPalOrder',
  'capturePayPalOrder',
  'capturePayPalAuthorization',
  'voidPayPalAuthorization',
  'updatePayPalOrder',
  'getPayPalOrder',
  'getPayPalCapture',
  'refundPayPalOrder',
  'createTrackingInformation',
  'updateTrackingInformation',
];

const PAYPAL_API_CUSTOMER_ENDPOINTS = [
  'createVaultSetupToken',
  'getUserIDToken',
  'createPaymentToken',
  'getPaymentTokens',
  'deletePaymentToken',
];

type EndpointData = {
  resourceTypeId: string;
  condition: string;
  timeoutInMs: number;
};

export type ExtensionKey =
  | typeof PAYPAL_PAYMENT_EXTENSION_KEY
  | typeof PAYPAL_CUSTOMER_EXTENSION_KEY;

const extensionData: Record<ExtensionKey, EndpointData> = {
  [PAYPAL_PAYMENT_EXTENSION_KEY]: {
    resourceTypeId: 'payment',
    condition: mapEndpointsToCondition(PAYPAL_API_PAYMENT_ENDPOINTS),
    timeoutInMs: 10000,
  },
  [PAYPAL_CUSTOMER_EXTENSION_KEY]: {
    resourceTypeId: 'customer',
    condition: mapEndpointsToCondition(PAYPAL_API_CUSTOMER_ENDPOINTS),
    timeoutInMs: 2000,
  },
};

const newExtensionBody = (
  key: ExtensionKey,
  applicationUrl: string
): ExtensionDraft => {
  const { resourceTypeId, condition, timeoutInMs } = extensionData[key];
  return {
    key: key,
    timeoutInMs,
    destination: {
      type: 'HTTP',
      url: applicationUrl,
    },
    triggers: [
      {
        actions: ['Update'],
        resourceTypeId,
        condition,
      },
    ],
  };
};

export async function createExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string,
  extensionKey: ExtensionKey
) {
  await deleteExtension(apiRoot, extensionKey, applicationUrl);
  await apiRoot
    .extensions()
    .post({ body: newExtensionBody(extensionKey, applicationUrl) })
    .execute();
  logger.info(`extension with key ${extensionKey} is created`);
}

export async function deleteExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  extensionKey: string,
  applicationUrl: string
): Promise<void> {
  const extension = await findMatchingExtension(
    apiRoot,
    extensionKey,
    applicationUrl
  );
  if (extension) {
    await apiRoot
      .extensions()
      .withKey({ key: extensionKey })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}

export type PayPalCustomTypeKeys =
  | typeof PAYPAL_PAYMENT_TYPE_KEY
  | typeof PAYPAL_CUSTOMER_TYPE_KEY
  | typeof PAYPAL_PAYMENT_INTERACTION_TYPE_KEY;

const payPalCustomTypeKeys: PayPalCustomTypeKeys[] = [
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
];

type FieldDefinitionData = {
  name: string;
  label?: LocalizedString;
  typeName?: 'String' | 'DateTime';
  inputHint?: 'SingleLine' | 'MultiLine';
};

const apiCallNameToFieldData = (apiCallName: string): FieldDefinitionData[] => [
  {
    name: `${apiCallName}Request`,
    inputHint: 'MultiLine',
  },
  {
    name: `${apiCallName}Response`,
    inputHint: 'MultiLine',
  },
];

const customFieldsDefinitionData: Record<
  PayPalCustomTypeKeys,
  FieldDefinitionData[]
> = {
  [PAYPAL_PAYMENT_TYPE_KEY]: [
    {
      name: 'PayPalOrderId',
      label: {
        en: `PayPal Order Id`,
        de: 'PayPal Bestellnummer',
      },
    },
    {
      name: 'PayPalCustomId',
      label: {
        en: 'PayPal custom id',
      },
    },
    ...PAYPAL_API_PAYMENT_ENDPOINTS.map((endpoint) =>
      apiCallNameToFieldData(endpoint)
    ).flat(),
  ],
  [PAYPAL_CUSTOMER_TYPE_KEY]: [
    {
      name: 'PayPalUserId',
      label: {
        en: `PayPal User Id`,
        de: 'PayPal Kundernummer',
      },
    },
    ...PAYPAL_API_CUSTOMER_ENDPOINTS.map((endpoint) =>
      apiCallNameToFieldData(endpoint)
    ).flat(),
  ],
  [PAYPAL_PAYMENT_INTERACTION_TYPE_KEY]: [
    { name: 'type', inputHint: 'SingleLine' },
    { name: 'data', inputHint: 'MultiLine' },
    { name: 'timestamp', typeName: 'DateTime' },
  ],
};

const fieldCredentialsToDefinition = ({
  name,
  label,
  typeName,
  inputHint,
}: FieldDefinitionData): FieldDefinition => ({
  name,
  label: label ?? { en: name },
  type: { name: typeName ?? 'String' },
  inputHint,
  required: false,
});

const customTypesNames: Record<
  PayPalCustomTypeKeys,
  { name: LocalizedString; resourceTypeIds: string[]; key: string }
> = {
  [PAYPAL_PAYMENT_TYPE_KEY]: {
    name: {
      en: 'Custom payment type to PayPal fields',
    },
    resourceTypeIds: ['payment'],
    key: process.env.PAYMENT_TYPE_KEY ?? PAYPAL_PAYMENT_TYPE_KEY,
  },
  [PAYPAL_CUSTOMER_TYPE_KEY]: {
    name: {
      en: 'Custom customer type for PayPal fields',
    },
    resourceTypeIds: ['customer'],
    key: process.env.CUSTOMER_TYPE_KEY ?? PAYPAL_CUSTOMER_TYPE_KEY,
  },
  [PAYPAL_PAYMENT_INTERACTION_TYPE_KEY]: {
    name: {
      en: 'Custom payment interaction type to PayPal fields',
    },
    resourceTypeIds: ['payment-interface-interaction'],
    key:
      process.env.PAYMENT_INTERACTION_TYPE_KEY ??
      PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  },
};

const customTypeDataToCustomType = (key: PayPalCustomTypeKeys): TypeDraft => ({
  ...customTypesNames[key],
  fieldDefinitions: customFieldsDefinitionData[key].map(
    fieldCredentialsToDefinition
  ),
});

const customTypesDrafts = Object.fromEntries(
  payPalCustomTypeKeys.map((key) => [key, customTypeDataToCustomType(key)])
);

async function queryTypesByResourceId(
  apiRoot: ByProjectKeyRequestBuilder,
  resourceTypeId: string
) {
  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `resourceTypeIds contains any ("${resourceTypeId}")`,
      },
    })
    .execute();
  return types;
}

const findMatchingDefinitions = (
  newDefinitions: FieldDefinition[],
  existingDefinitions: FieldDefinition[],
  alreadyExisting = false
) =>
  newDefinitions.filter((newFieldDefinition: FieldDefinition): boolean => {
    const alreadyExists = existingDefinitions.some(
      (existingFieldDefinition: FieldDefinition): boolean =>
        newFieldDefinition.name === existingFieldDefinition.name
    );
    return alreadyExisting ? alreadyExists : !alreadyExists;
  });

async function updateType(
  apiRoot: ByProjectKeyRequestBuilder,
  key: string,
  version: number,
  actions: TypeUpdateAction[]
) {
  await apiRoot
    .types()
    .withKey({ key })
    .post({
      body: {
        version,
        actions,
      },
    })
    .execute();
}

export async function addOrUpdateCustomType(
  apiRoot: ByProjectKeyRequestBuilder,
  customTypeKey: PayPalCustomTypeKeys
): Promise<void> {
  const customTypeDraft = customTypesDrafts[customTypeKey];
  const actualKey = customTypeDraft.key;
  const types = await queryTypesByResourceId(
    apiRoot,
    customTypeDraft.resourceTypeIds[0]
  );
  for (const type of types) {
    const updates = findMatchingDefinitions(
      customTypeDraft.fieldDefinitions ?? [],
      type.fieldDefinitions,
      false
    ).map((fieldDefinition: FieldDefinition): TypeAddFieldDefinitionAction => {
      return {
        action: 'addFieldDefinition',
        fieldDefinition: fieldDefinition,
      };
    });
    if (updates.length > 0) {
      await updateType(apiRoot, type.key, type.version, updates);
      logger.info(`existing type ${type.key} is updated`);
    }
  }
  if (!types.find((type) => type.key === actualKey)) {
    await apiRoot
      .types()
      .post({
        body: customTypeDraft,
      })
      .execute();
    logger.info(`type ${actualKey} is created`);
  }
}

export async function deleteOrUpdateCustomType(
  apiRoot: ByProjectKeyRequestBuilder,
  customType: PayPalCustomTypeKeys
) {
  const customTypeDraft = customTypesDrafts[customType];
  const types = await queryTypesByResourceId(
    apiRoot,
    customTypeDraft.resourceTypeIds[0]
  );
  for (const type of types) {
    const { key, version, fieldDefinitions } = type;
    const updates = findMatchingDefinitions(
      customTypeDraft.fieldDefinitions ?? [],
      fieldDefinitions,
      true
    ).map(
      (fieldDefinition: FieldDefinition): TypeRemoveFieldDefinitionAction => ({
        action: 'removeFieldDefinition',
        fieldName: fieldDefinition.name,
      })
    );
    if (type.fieldDefinitions?.length === updates.length) {
      try {
        await apiRoot
          .types()
          .withKey({ key })
          .delete({
            queryArgs: {
              version,
            },
          })
          .execute();
        logger.info(`custom type with key ${key} is deleted`);
      } catch (e) {
        logger.warn(
          `could not delete custom type ${key}: error "${
            (e as Error).message
          }" received`
        );
      }
    } else {
      if (updates.length) {
        await updateType(apiRoot, key, version, updates);
        logger.info(
          `only fields related to custom type ${customType} of type ${key} were removed`
        );
      } else
        logger.info(
          `type ${key} had no fields that match the custom type ${customType}`
        );
    }
  }
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

export async function createAndSetCustomObject(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  let existingSettings: Record<string, any>;
  try {
    const existingSettingsObject = await apiRoot
      .customObjects()
      .withContainerAndKey({
        container: GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
        key: GRAPHQL_CUSTOMOBJECT_KEY_NAME,
      })
      .get()
      .execute();

    existingSettings = existingSettingsObject.body.value;
  } catch {
    existingSettings = {};
  }

  const settingsPayload = {
    ...CUSTOM_OBJECT_DEFAULT_VALUES,
    ...existingSettings,
  };
  await apiRoot
    .customObjects()
    .post({
      body: {
        key: GRAPHQL_CUSTOMOBJECT_KEY_NAME,
        container: GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
        value: settingsPayload,
      },
    })
    .execute();
}

export const deleteAccessTokenIfExists = async () => {
  if (await getCachedAccessToken()) {
    await deleteAccessToken();
  }
};
