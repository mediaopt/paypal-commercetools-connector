import { describe, test, expect } from "@jest/globals";
import { toPaymentMethodIconKey } from "../../src/utils/paymentMethodIcon.utils";
import {
  PaymentMethodType,
  StandardPaymentMethodType,
} from "../../src/dtos/paypal-payment.dto";

describe("paymentMethodIcon.utils", () => {
  describe("toPaymentMethodIconKey", () => {
    test.each<[PaymentMethodType, string]>([
      [StandardPaymentMethodType.CREDIT_CARD, "card"],
      [StandardPaymentMethodType.PAYPAL, "paypal"],
    ])("maps %s to %s", (methodType, expectedIcon) => {
      expect(toPaymentMethodIconKey(methodType)).toBe(expectedIcon);
    });

    test("all PaymentMethodType values have a mapping", () => {
      const allTypes = Object.values(
        StandardPaymentMethodType
      ) as PaymentMethodType[];
      for (const type of allTypes) {
        expect(() => toPaymentMethodIconKey(type)).not.toThrow();
        expect(toPaymentMethodIconKey(type)).toBeDefined();
      }
    });
  });
});
