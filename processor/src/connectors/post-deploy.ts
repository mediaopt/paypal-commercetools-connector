import * as dotenv from "dotenv";
dotenv.config();

import { TypeDraft } from "@commercetools/platform-sdk";
import {
  apiCallNameToFieldData,
  CUSTOM_TYPE_DESCRIPTORS,
  CustomTypeShape,
  FieldDefinitionData,
  PAYPAL_ORDER_ID_FIELD,
  PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS,
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
  PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES,
  PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES,
  PAYPAL_USER_ID_FIELD,
  toFieldDefinition,
} from "common-connect";
import { paymentSDK } from "../payment-sdk";
import { getConfig } from "../config/config";

// Builds the TypeDraft processor itself needs for one custom type — the actual create-if-missing /
// add-missing-fields orchestration is delegated to paymentSDK.ctCustomTypeService.createOrUpdate()
// below (built into @commercetools/connect-payments-sdk, which processor already depends on and
// already constructs paymentSDK from) rather than hand-rolled here. Never touches any of
// paypal-commercetools-extension's own fields — those stay the extension's job.
const buildTypeDraft = (
  key: string,
  { name, resourceTypeIds }: CustomTypeShape,
  fields: FieldDefinitionData[]
): TypeDraft => ({
  key,
  name,
  resourceTypeIds,
  fieldDefinitions: fields.map(toFieldDefinition),
});

async function ensureProcessorFields(): Promise<void> {
  const typeSpecs: {
    typeKey: string;
    shape: CustomTypeShape;
    fields: FieldDefinitionData[];
  }[] = [
    {
      typeKey: getConfig().paymentTypeKey,
      shape: CUSTOM_TYPE_DESCRIPTORS[PAYPAL_PAYMENT_TYPE_KEY],
      fields: [
        PAYPAL_ORDER_ID_FIELD,
        ...PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES.flatMap((name) =>
          apiCallNameToFieldData(name, true)
        ),
      ],
    },
    {
      typeKey: getConfig().customerTypeKey,
      shape: CUSTOM_TYPE_DESCRIPTORS[PAYPAL_CUSTOMER_TYPE_KEY],
      fields: [
        PAYPAL_USER_ID_FIELD,
        ...PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES.flatMap((name) =>
          apiCallNameToFieldData(name, true)
        ),
      ],
    },
    {
      typeKey: getConfig().interactionTypeKey,
      shape: CUSTOM_TYPE_DESCRIPTORS[PAYPAL_PAYMENT_INTERACTION_TYPE_KEY],
      fields: PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS,
    },
  ];

  await Promise.all(
    typeSpecs.map(({ typeKey, shape, fields }) =>
      paymentSDK.ctCustomTypeService.createOrUpdate(
        buildTypeDraft(typeKey, shape, fields)
      )
    )
  );
}

async function postDeploy(_properties: Map<string, unknown>) {
  await ensureProcessorFields();
}

async function runPostDeployScripts() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    }
    process.exitCode = 1;
  }
}

runPostDeployScripts();
