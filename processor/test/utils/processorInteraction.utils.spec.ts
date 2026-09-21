import { describe, test, expect } from "@jest/globals";
import {
  buildProcessorLogging,
  buildProcessorCustomerLogging,
} from "../../src/utils/processorInteraction.utils";
import { getConfig } from "../../src/config/config";

describe("processorInteraction.utils", () => {
  describe("buildProcessorLogging", () => {
    test("requests use a distinct ProcessorRequest field name, never colliding with the extension's own Request field", () => {
      const { customFieldValues } = buildProcessorLogging(
        "createPayPalOrder",
        { intent: "CAPTURE" },
        { id: "order-id" }
      );

      expect(Object.keys(customFieldValues)).toContain(
        "createPayPalOrderProcessorRequest"
      );
      expect(Object.keys(customFieldValues)).not.toContain(
        "createPayPalOrderRequest"
      );
    });

    test("responses use the same field name the extension itself would write, not a Processor-prefixed one", () => {
      const { customFieldValues } = buildProcessorLogging(
        "capturePayPalOrder",
        { orderID: "order-id" },
        { status: "COMPLETED" }
      );

      expect(Object.keys(customFieldValues)).toContain(
        "capturePayPalOrderResponse"
      );
      expect(Object.keys(customFieldValues)).not.toContain(
        "capturePayPalOrderProcessorResponse"
      );
    });

    test("customFieldValues are JSON-stringified", () => {
      const request = { orderID: "order-id" };
      const response = { status: "APPROVED" };
      const { customFieldValues } = buildProcessorLogging(
        "authorizePayPalOrder",
        request,
        response
      );

      expect(customFieldValues["authorizePayPalOrderProcessorRequest"]).toBe(
        JSON.stringify(request)
      );
      expect(customFieldValues["authorizePayPalOrderResponse"]).toBe(
        JSON.stringify(response)
      );
    });

    test("pspInteractions mirror the same two field names as interaction `type` values, under the resolved interactionTypeKey", () => {
      const { pspInteractions } = buildProcessorLogging(
        "createPayPalOrder",
        { a: 1 },
        { b: 2 }
      );

      expect(pspInteractions).toHaveLength(2);
      expect(pspInteractions[0]).toEqual({
        type: { typeId: "type", key: getConfig().interactionTypeKey },
        fields: {
          type: "createPayPalOrderProcessorRequest",
          data: JSON.stringify({ a: 1 }),
          timestamp: expect.any(String),
        },
      });
      expect(pspInteractions[1]).toEqual({
        type: { typeId: "type", key: getConfig().interactionTypeKey },
        fields: {
          type: "createPayPalOrderResponse",
          data: JSON.stringify({ b: 2 }),
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe("buildProcessorCustomerLogging", () => {
    test("requests use a distinct ProcessorRequest field name, never colliding with the extension's own Request field", () => {
      const actions = buildProcessorCustomerLogging(
        "getPaymentTokens",
        { customerId: "paypal-customer-id" },
        { payment_tokens: [] }
      );

      const names = actions.map((action) =>
        "name" in action ? action.name : undefined
      );
      expect(names).toContain("getPaymentTokensProcessorRequest");
      expect(names).not.toContain("getPaymentTokensRequest");
    });

    test("responses use the same field name the extension itself would write, not a Processor-prefixed one", () => {
      const actions = buildProcessorCustomerLogging(
        "deletePaymentToken",
        { paymentToken: "token-id" },
        { status: "success" }
      );

      const names = actions.map((action) =>
        "name" in action ? action.name : undefined
      );
      expect(names).toContain("deletePaymentTokenResponse");
      expect(names).not.toContain("deletePaymentTokenProcessorResponse");
    });

    test("returns setCustomField actions with JSON-stringified values", () => {
      const request = { customerId: "paypal-customer-id" };
      const response = "user-id-token";
      const actions = buildProcessorCustomerLogging(
        "getUserIDToken",
        request,
        response
      );

      expect(actions).toEqual([
        {
          action: "setCustomField",
          name: "getUserIDTokenProcessorRequest",
          value: JSON.stringify(request),
        },
        {
          action: "setCustomField",
          name: "getUserIDTokenResponse",
          value: JSON.stringify(response),
        },
      ]);
    });
  });
});
