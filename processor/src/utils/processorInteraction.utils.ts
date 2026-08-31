import { CustomFieldsDraft } from "@commercetools/platform-sdk";
import { getConfig } from "../config/config";

// Only the PayPal API calls processor itself makes on the buyer's behalf — matches the current
// logging scope (createOrder/authorizeOrder/captureOrder). Also consumed by connectors/post-deploy.ts
// to provision the matching "${apiCallName}ProcessorRequest" field definitions.
export const PROCESSOR_API_CALL_NAMES = [
  "createPayPalOrder",
  "authorizePayPalOrder",
  "capturePayPalOrder",
] as const;
export type ProcessorApiCallName = (typeof PROCESSOR_API_CALL_NAMES)[number];

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
 * logging both the request processor sent PayPal (as "${apiCallName}ProcessorRequest", processor-
 * only) and the successful response it got back (as "${apiCallName}Response", shared with the
 * extension). Success only - see paypal-payment.service.ts's callers). Requires the payment to already
 * carry the paymentTypeKey custom type (see createPayment()'s setCustomType) before
 * customFieldValues can be applied.
 */
export const buildProcessorLogging = (
  apiCallName: ProcessorApiCallName,
  request: unknown,
  response: unknown
): {
  pspInteractions: CustomFieldsDraft[];
  customFieldValues: Record<string, string>;
} => {
  const requestFieldName = `${apiCallName}ProcessorRequest`;
  const responseFieldName = `${apiCallName}Response`;
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
