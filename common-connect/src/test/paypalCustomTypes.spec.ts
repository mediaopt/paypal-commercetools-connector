import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  apiCallNameToFieldData,
  CUSTOM_TYPE_DESCRIPTORS,
  PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS,
  PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES,
  PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES,
  PAYPAL_USER_ID_FIELD,
  resolveTypeKey,
  toFieldDefinition,
} from "../paypalCustomTypes";
import {
  PAYPAL_PAYMENT_TYPE_KEY,
  PAYPAL_CUSTOMER_TYPE_KEY,
  PAYPAL_PAYMENT_INTERACTION_TYPE_KEY,
} from "../constants";

describe("apiCallNameToFieldData", () => {
  test("uses the extension's own Request naming by default", () => {
    expect(apiCallNameToFieldData("createPayPalOrder")).toEqual([
      { name: "createPayPalOrderRequest", inputHint: "MultiLine" },
      { name: "createPayPalOrderResponse", inputHint: "MultiLine" },
    ]);
  });

  test("uses ProcessorRequest naming when isProcessor is true, keeping the same Response name", () => {
    expect(apiCallNameToFieldData("createPayPalOrder", true)).toEqual([
      { name: "createPayPalOrderProcessorRequest", inputHint: "MultiLine" },
      { name: "createPayPalOrderResponse", inputHint: "MultiLine" },
    ]);
  });
});

describe("toFieldDefinition", () => {
  test("defaults label to { en: name } and type to String when unset", () => {
    expect(toFieldDefinition({ name: "PayPalOrderId" })).toEqual({
      name: "PayPalOrderId",
      label: { en: "PayPalOrderId" },
      type: { name: "String" },
      inputHint: undefined,
      required: false,
    });
  });

  test("uses the given label/typeName/inputHint when set", () => {
    expect(
      toFieldDefinition({
        name: "timestamp",
        typeName: "DateTime",
        inputHint: "SingleLine",
      })
    ).toEqual({
      name: "timestamp",
      label: { en: "timestamp" },
      type: { name: "DateTime" },
      inputHint: "SingleLine",
      required: false,
    });
  });
});

describe("processor's narrow endpoint-name lists", () => {
  test("payment call names has no duplicates and matches the 6 endpoints processor actually calls", () => {
    expect(new Set(PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES).size).toBe(
      PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES.length
    );
    expect(PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES).toEqual(
      expect.arrayContaining([
        "createPayPalOrder",
        "authorizePayPalOrder",
        "capturePayPalOrder",
        "capturePayPalAuthorization",
        "getPayPalOrder",
        "updatePayPalOrder",
      ])
    );
    expect(PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES).toHaveLength(6);
  });

  test("customer call names has no duplicates and matches the 3 endpoints processor actually calls", () => {
    expect(new Set(PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES).size).toBe(
      PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES.length
    );
    expect(PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES).toEqual(
      expect.arrayContaining([
        "getPaymentTokens",
        "deletePaymentToken",
        "getUserIDToken",
      ])
    );
    expect(PAYPAL_PROCESSOR_CUSTOMER_API_CALL_NAMES).toHaveLength(3);
  });
});

describe("shared type-level data", () => {
  test("CUSTOM_TYPE_DESCRIPTORS carries the right resourceTypeIds per type", () => {
    expect(CUSTOM_TYPE_DESCRIPTORS[PAYPAL_PAYMENT_TYPE_KEY].resourceTypeIds).toEqual([
      "payment",
    ]);
    expect(CUSTOM_TYPE_DESCRIPTORS[PAYPAL_CUSTOMER_TYPE_KEY].resourceTypeIds).toEqual([
      "customer",
    ]);
    expect(
      CUSTOM_TYPE_DESCRIPTORS[PAYPAL_PAYMENT_INTERACTION_TYPE_KEY].resourceTypeIds
    ).toEqual(["payment-interface-interaction"]);
  });

  test("PAYPAL_USER_ID_FIELD/PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS have the expected shape", () => {
    expect(PAYPAL_USER_ID_FIELD.name).toBe("PayPalUserId");
    expect(PAYPAL_PAYMENT_INTERACTION_TYPE_FIELDS.map((f) => f.name)).toEqual([
      "type",
      "data",
      "timestamp",
    ]);
  });
});

describe("resolveTypeKey", () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.PAYMENT_TYPE_KEY;
    delete process.env.CUSTOMER_TYPE_KEY;
    delete process.env.PAYMENT_INTERACTION_TYPE_KEY;
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  test("returns the default key when the matching env var is unset", () => {
    expect(resolveTypeKey(PAYPAL_PAYMENT_TYPE_KEY)).toBe(PAYPAL_PAYMENT_TYPE_KEY);
    expect(resolveTypeKey(PAYPAL_CUSTOMER_TYPE_KEY)).toBe(PAYPAL_CUSTOMER_TYPE_KEY);
    expect(resolveTypeKey(PAYPAL_PAYMENT_INTERACTION_TYPE_KEY)).toBe(
      PAYPAL_PAYMENT_INTERACTION_TYPE_KEY
    );
  });

  test("returns the env var's value when set, per type", () => {
    process.env.PAYMENT_TYPE_KEY = "custom-payment-type";
    process.env.CUSTOMER_TYPE_KEY = "custom-customer-type";
    process.env.PAYMENT_INTERACTION_TYPE_KEY = "custom-interaction-type";

    expect(resolveTypeKey(PAYPAL_PAYMENT_TYPE_KEY)).toBe("custom-payment-type");
    expect(resolveTypeKey(PAYPAL_CUSTOMER_TYPE_KEY)).toBe("custom-customer-type");
    expect(resolveTypeKey(PAYPAL_PAYMENT_INTERACTION_TYPE_KEY)).toBe(
      "custom-interaction-type"
    );
  });
});
