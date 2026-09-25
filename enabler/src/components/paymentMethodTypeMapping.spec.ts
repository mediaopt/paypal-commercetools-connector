import { toPayPalPaymentMethodType } from "./paymentMethodTypeMapping";

describe("paymentMethodTypeMapping", () => {
  describe("toPayPalPaymentMethodType", () => {
    it("maps the commercetools icon key for card to CardFields", () => {
      expect(toPayPalPaymentMethodType("card")).toBe("CardFields");
    });

    it("maps the commercetools icon key for paypal to PayPal", () => {
      expect(toPayPalPaymentMethodType("paypal")).toBe("PayPal");
    });

    it("maps the commercetools icon key for bancontact to Bancontact", () => {
      expect(toPayPalPaymentMethodType("bancontactcard")).toBe("Bancontact");
    });

    it("maps the commercetools icon key for p24 to P24", () => {
      expect(toPayPalPaymentMethodType("przelewy24")).toBe("P24");
    });

    it("passes through an already-canonical value unchanged", () => {
      expect(toPayPalPaymentMethodType("CardFields")).toBe("CardFields");
      expect(toPayPalPaymentMethodType("PayPal")).toBe("PayPal");
    });

    it("passes through an unrecognized value unchanged", () => {
      expect(toPayPalPaymentMethodType("something-unknown")).toBe(
        "something-unknown"
      );
    });
  });
});
