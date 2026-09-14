import { FieldDefinition } from "@commercetools/platform-sdk";
import { LocalizedString } from "@commercetools/platform-sdk/dist/declarations/src/generated/models/common";
import {
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
} from "./constants";

export type PayPalCustomTypeKeys =
  | typeof PAYPAL_PAYMENT_TYPE_KEY
  | typeof PAYPAL_CUSTOMER_TYPE_KEY
  | typeof PAYPAL_PAYMENT_INTERACTION_TYPE_KEY;

export type FieldDefinitionData = {
  name: string;
  label?: LocalizedString;
  typeName?: "String" | "DateTime";
  inputHint?: "SingleLine" | "MultiLine";
};

// The exact PayPal REST calls processor itself makes, per type — genuinely used by both
// processor (directly, to build its own field list) and paypal-commercetools-extension (to
// compose its own full endpoint list without duplicating these same names). Everything
// extension-only (the rest of its endpoint list, PayPalCustomId, the assembled full per-type field
// data) stays local to the extension's own connector/actions.ts. `as const` so
// processor/src/utils/processorInteraction.utils.ts's own (deliberately narrower) subset can be
// checked against this list at compile time instead of silently drifting from it.
export const PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES = [
  "createPayPalOrder",
  "authorizePayPalOrder",
  "capturePayPalOrder",
  "capturePayPalAuthorization",
  "getPayPalOrder",
  "updatePayPalOrder",
] as const;

export const PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES = [
  "getPaymentTokens",
  "deletePaymentToken",
  "getUserIDToken",
] as const;

export const PAYPAL_USER_ID_FIELD: FieldDefinitionData = {
  name: "PayPalUserId",
  label: { en: "PayPal User Id", de: "PayPal Kundernummer" },
};

export const PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS: FieldDefinitionData[] = [
  { name: "type", inputHint: "SingleLine" },
  { name: "data", inputHint: "MultiLine" },
  { name: "timestamp", typeName: "DateTime" },
];

// Builds the Request/Response field pair for one PayPal API call. The response field name is
// always shared with paypal-commercetools-extension, so a call processor made can still be
// read/fine-tuned via the extension afterward from one unified field. The request field name
// differs when isProcessor is true — processor must never write the extension's own
// "${apiCallName}Request" name, since that's exactly what the extension's CT Extension trigger
// fires on
export const apiCallNameToFieldData = (
  apiCallName: string,
  isProcessor = false
): FieldDefinitionData[] => [
  {
    name: `${apiCallName}${isProcessor ? "ProcessorRequest" : "Request"}`,
    inputHint: "MultiLine",
  },
  { name: `${apiCallName}Response`, inputHint: "MultiLine" },
];

export const toFieldDefinition = (
  spec: FieldDefinitionData
): FieldDefinition => ({
  name: spec.name,
  label: spec.label ?? { en: spec.name },
  type: { name: spec.typeName ?? "String" },
  inputHint: spec.inputHint,
  required: false,
});

// name/resourceTypeIds describe the type's shape; envVarName is the env var a merchant can use to
// override its key (see resolveTypeKey).
// `CustomTypeShape` is exported separately for consumers that build a real commercetools TypeDraft
// from a descriptor — they should pick just those two fields, not spread the whole descriptor, so
// `envVarName` (internal bookkeeping) never leaks into an actual CT API payload.
export type CustomTypeShape = { name: LocalizedString; resourceTypeIds: string[] };

export const CUSTOM_TYPE_DESCRIPTORS: Record<
  PayPalCustomTypeKeys,
  CustomTypeShape & { envVarName: string }
> = {
  [PAYPAL_PAYMENT_TYPE_KEY]: {
    name: { en: "Custom payment type to PayPal fields" },
    resourceTypeIds: ["payment"],
    envVarName: "PAYMENT_TYPE_KEY",
  },
  [PAYPAL_CUSTOMER_TYPE_KEY]: {
    name: { en: "Custom customer type for PayPal fields" },
    resourceTypeIds: ["customer"],
    envVarName: "CUSTOMER_TYPE_KEY",
  },
  [PAYPAL_PAYMENT_INTERACTION_TYPE_KEY]: {
    name: { en: "Custom payment interaction type to PayPal fields" },
    resourceTypeIds: ["payment-interface-interaction"],
    envVarName: "PAYMENT_INTERACTION_TYPE_KEY",
  },
};

// The one place this env-var-override-else-default resolution is implemented — both processor's
// config.ts and paypal-commercetools-extension's connector/actions.ts call this
export const resolveTypeKey = (defaultKey: PayPalCustomTypeKeys): string =>
  process.env[CUSTOM_TYPE_DESCRIPTORS[defaultKey].envVarName] || defaultKey;
