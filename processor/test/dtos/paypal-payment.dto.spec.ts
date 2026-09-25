import { describe, test, expect } from "@jest/globals";
import { Value } from "@sinclair/typebox/value";
import { CreateOrderRequestSchema } from "../../src/dtos/paypal-payment.dto";

describe("CreateOrderRequestSchema", () => {
  test.each(["PayUponInvoice", "Sepa", "Venmo"])(
    "accepts paymentMethodType %s",
    (paymentMethodType) => {
      expect(
        Value.Check(CreateOrderRequestSchema, {
          paymentId: "payment-id",
          paymentMethodType,
        })
      ).toBe(true);
    }
  );

  test("paymentMethodType stays optional", () => {
    expect(
      Value.Check(CreateOrderRequestSchema, { paymentId: "payment-id" })
    ).toBe(true);
  });
});
