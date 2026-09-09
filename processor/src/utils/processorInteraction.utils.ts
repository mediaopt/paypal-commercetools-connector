import { CustomFieldsDraft, CustomerUpdateAction } from "@commercetools/platform-sdk";
import {
  apiCallNameToFieldData,
  PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES,
  PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES,
} from "common-connect";
import { getConfig } from "../config/config";

// Every PayPal API call processor's own audit logging covers — same full list common-connect
// already provisions custom fields for (see connectors/post-deploy.ts).
export const PROCESSOR_API_CALL_NAMES = PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES;
export type ProcessorApiCallName = (typeof PROCESSOR_API_CALL_NAMES)[number];

// Customer-level counterpart — same field-provisioning source (post-deploy), but these calls
// read/write a CT Customer, not a CT Payment, so they get their own logging shape below (no
// pspInteractions — Customer has no interface-interaction concept, only custom fields).
export const PROCESSOR_CUSTOMER_API_CALL_NAMES =
  PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES;
export type ProcessorCustomerApiCallName =
  (typeof PROCESSOR_CUSTOMER_API_CALL_NAMES)[number];

// Requests use a name distinct from paypal-commercetools-extension's own "${apiCallName}Request"
// — the extension's CT Extension triggers on exactly that field being defined
// (mapEndpointsToCondition), so processor writing a differently-named field can never
// accidentally invoke that webhook. Responses don't have this risk (never part of the trigger
// condition), so they intentionally use the *same* "${apiCallName}Response" name the extension
// itself would write — one unified response field per action regardless of which module produced
// it, so a payment processor touched can still be picked up and fine-tuned via the extension
// afterward, reading the same field either way.
const buildInteractionDraft = (
  fieldName: string,
  serializedMessage: string
): CustomFieldsDraft => ({
  type: { typeId: "type", key: getConfig().interactionTypeKey },
  fields: {
    type: fieldName,
    data: serializedMessage,
    timestamp: new Date().toISOString(),
  },
});

/**
 * Builds the pspInteractions/customFieldValues to pass into ctPaymentService.updatePayment(),
 * logging a processor-owned customer-level PayPal request/response pair — success only.
 * Uses "${apiCallName}ProcessorRequest" "${apiCallName}Response" naming convention to
 * prevent triggering extension while keeping compatibility
 * Requires the payment to have paymentTypeKey custom type
 */
export const buildProcessorLogging = (
  apiCallName: ProcessorApiCallName,
  request: unknown,
  response: unknown
): {
  pspInteractions: CustomFieldsDraft[];
  customFieldValues: Record<string, string>;
} => {
  const [{ name: requestFieldName }, { name: responseFieldName }] =
    apiCallNameToFieldData(apiCallName, true);
  const serializedRequest = JSON.stringify(request);
  const serializedResponse = JSON.stringify(response);
  return {
    pspInteractions: [
      buildInteractionDraft(requestFieldName, serializedRequest),
      buildInteractionDraft(responseFieldName, serializedResponse),
    ],
    customFieldValues: {
      [requestFieldName]: serializedRequest,
      [responseFieldName]: serializedResponse,
    },
  };
};

/**
 * Builds the setCustomField actions to pass into PayPalCustomerService.updateCtCustomer(),
 * logging a processor-owned customer-level PayPal request/response pair — success and failure.
 * Failure is non-blocking for payment process.
 * Uses "${apiCallName}ProcessorRequest" "${apiCallName}Response" naming convention to
 * prevent triggering extension while keeping compatibility
 */
export const buildProcessorCustomerLogging = (
  apiCallName: ProcessorCustomerApiCallName,
  request: unknown,
  response: unknown
): CustomerUpdateAction[] => {
  const [{ name: requestFieldName }, { name: responseFieldName }] =
    apiCallNameToFieldData(apiCallName, true);
  return [
    { action: "setCustomField", name: requestFieldName, value: JSON.stringify(request) },
    { action: "setCustomField", name: responseFieldName, value: JSON.stringify(response) },
  ];
};
