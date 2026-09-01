import * as dotenv from 'dotenv';
dotenv.config();

import { paymentSDK } from '../payment-sdk';
import { getConfig } from '../config/config';
import { PROCESSOR_API_CALL_NAMES } from '../utils/processorInteraction.utils';

// Only the request side needs its own field — "${apiCallName}ProcessorRequest", distinct from the
// extension's own "${apiCallName}Request" (see utils/processorInteraction.utils.ts for why).
// "${apiCallName}Response" is deliberately NOT provisioned here: processor writes into that exact
// same field name the extension already owns/provisions (PAYPAL_API_PAYMENT_ENDPOINTS in the
// extension's connector/actions.ts already includes all 3 of these endpoints), so a payment
// processor touched can still be read/fine-tuned via the extension afterward from one unified
// response field, not two different ones depending on which module produced it.
const processorRequestFieldNames = PROCESSOR_API_CALL_NAMES.map(
  (apiCallName) => `${apiCallName}ProcessorRequest`
);

/**
 * Adds only processor's own request field definitions (see utils/processorInteraction.utils.ts)
 * to the existing paypal-payment-type custom type — never the type itself, and never
 * paypal-commercetools-extension's own "${apiCallName}Request"/"${apiCallName}Response" fields.
 * Ensuring the type exists at all (and everything about the extension's own fields, including the
 * "${apiCallName}Response" fields processor also writes into) is the extension's post-deploy's
 * job, not processor's: if the type isn't there yet (extension never deployed), this just logs and
 * skips — processor-owned logging won't persist until it is, but that's a deployment-order issue
 * for the merchant to resolve, not something processor should try to fix itself by creating a type
 * it doesn't own.
 */
async function ensureProcessorFields(): Promise<void> {
  const typeKey = getConfig().paymentTypeKey;

  let existingType;
  try {
    const response = await paymentSDK.ctAPI.client
      .types()
      .withKey({ key: typeKey })
      .get()
      .execute();
    existingType = response.body;
  } catch (e) {
    process.stderr.write(
      `post-deploy: ${typeKey} custom type not found — skipping processor field provisioning ` +
        `(that type is created by paypal-commercetools-extension's own post-deploy; deploy it first)\n`
    );
    return;
  }

  const existingFieldNames = new Set(
    existingType.fieldDefinitions.map((field) => field.name)
  );
  const missingFieldNames = processorRequestFieldNames.filter(
    (name) => !existingFieldNames.has(name)
  );
  if (!missingFieldNames.length) return;

  await paymentSDK.ctAPI.client
    .types()
    .withKey({ key: typeKey })
    .post({
      body: {
        version: existingType.version,
        actions: missingFieldNames.map((name) => ({
          action: 'addFieldDefinition' as const,
          fieldDefinition: {
            name,
            label: { en: name },
            required: false,
            type: { name: 'String' as const },
            inputHint: 'MultiLine' as const,
          },
        })),
      },
    })
    .execute();
  process.stdout.write(
    `post-deploy: added processor field definitions to ${typeKey}: ${missingFieldNames.join(', ')}\n`
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
