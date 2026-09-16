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
  CUSTOM_TYPE_DESCRIPTORS,
  FieldDefinitionData,
  GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
  GRAPHQL_CUSTOMOBJECT_KEY_NAME,
  PAYPAL_CUSTOMER_EXTENSION_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_ORDER_ID_FIELD,
  PAYPAL_PAYMENT_EXTENSION_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES,
  PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES,
  PAYPAL_USER_ID_FIELD,
  PayPalCustomTypeKeys,
  apiCallNameToFieldData,
  resolveTypeKey,
  toFieldDefinition,
  logger,
  getCachedAccessToken,
} from 'common-connect/dist';
import { deleteAccessToken } from '../service/config.service';
import { findMatchingExtension } from '../service/commercetools.service';

// The shared calls can be processed by extension after it was set on processor
const PAYPAL_API_PAYMENT_ENDPOINTS = [
  ...PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES,
  'getClientToken',
  'voidPayPalAuthorization',
  'getPayPalCapture',
  'refundPayPalOrder',
  'createTrackingInformation',
  'updateTrackingInformation',
];

const PAYPAL_API_CUSTOMER_ENDPOINTS = [
  ...PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES,
  'createVaultSetupToken',
  'createPaymentToken',
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
  await deleteExtension(apiRoot, extensionKey);
  await apiRoot
    .extensions()
    .post({ body: newExtensionBody(extensionKey, applicationUrl) })
    .execute();
  logger.info(`new extension with key ${extensionKey} is created`);
}

export async function deleteExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  extensionKey: string
): Promise<void> {
  const extension = await findMatchingExtension(apiRoot, extensionKey);
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
  logger.info(`extension ${extensionKey} is deleted`);
}

export type { PayPalCustomTypeKeys };

const payPalCustomTypeKeys: PayPalCustomTypeKeys[] = [
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
];

// PayPalCustomId is extension-only — processor never writes it, so it stays local rather than
// living in common-connect.
const PAYPAL_CUSTOM_ID_FIELD: FieldDefinitionData = {
  name: 'PayPalCustomId',
  label: { en: 'PayPal custom id' },
};

// The full field set per type — this extension's own schema (every field it provisions), using
// the full endpoint lists above. If used processor builds its own narrower, ProcessorRequest-named list
// separately (see its own connectors/post-deploy.ts), reusing common-connect
const customFieldsDefinitionData: Record<
  PayPalCustomTypeKeys,
  FieldDefinitionData[]
> = {
  [PAYPAL_PAYMENT_TYPE_KEY]: [
    PAYPAL_ORDER_ID_FIELD,
    PAYPAL_CUSTOM_ID_FIELD,
    ...PAYPAL_API_PAYMENT_ENDPOINTS.flatMap((name) =>
      apiCallNameToFieldData(name)
    ),
  ],
  [PAYPAL_CUSTOMER_TYPE_KEY]: [
    PAYPAL_USER_ID_FIELD,
    ...PAYPAL_API_CUSTOMER_ENDPOINTS.flatMap((name) =>
      apiCallNameToFieldData(name)
    ),
  ],
  [PAYPAL_PAYMENT_INTERACTION_TYPE_KEY]: PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS,
};

// Looks up name/resourceTypeIds directly off CUSTOM_TYPE_DESCRIPTORS
// and resolves the key through common-connect — to ensure processors compatibility.
const customTypeDataToCustomType = (key: PayPalCustomTypeKeys): TypeDraft => {
  const { name, resourceTypeIds } = CUSTOM_TYPE_DESCRIPTORS[key];
  return {
    key: resolveTypeKey(key),
    name,
    resourceTypeIds,
    fieldDefinitions: customFieldsDefinitionData[key].map(toFieldDefinition),
  };
};

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
    } else logger.info(`type ${type.key} already had all necessary fields`);
  }
  if (!types.find((type) => type.key === actualKey)) {
    await apiRoot
      .types()
      .post({
        body: customTypeDraft,
      })
      .execute();
    logger.info(`type ${actualKey} is created`);
  } else logger.info(`the type ${actualKey} already existed`);
}

export async function deleteOrUpdateCustomType(
  apiRoot: ByProjectKeyRequestBuilder,
  customType: PayPalCustomTypeKeys
) {
  const customTypeDraft = customTypesDrafts[customType];
  const actualKey = customTypeDraft.key;
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
          `only fields related to custom type ${actualKey} of type ${key} were removed`
        );
      } else
        logger.info(
          `type ${key} had no fields that match the custom type ${actualKey}`
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
    logger.info('previous access token is deleted');
  }
};
