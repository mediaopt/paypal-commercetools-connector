import { PayPalPaymentMethodType } from "../types";

type CartEligibility = { countries?: string[]; currencies?: string[] };

// Cart country/currency each payment method is restricted to; a method without an entry is not
// restricted here. countryCode is the billing country, falling back to the cart country.
// To enforce a commented-out method, uncomment its line — verify the pair against PayPal's docs first.
const CART_ELIGIBILITY_BY_PAYMENT_METHOD_TYPE: Partial<
  Record<PayPalPaymentMethodType, CartEligibility>
> = {
  PayUponInvoice: { countries: ["DE"], currencies: ["EUR"] },
  Venmo: { countries: ["US"], currencies: ["USD"] },
  // PayLater: { countries: ["AU", "US", "FR", "DE", "IT", "ES", "GB"] },
  // Ideal: { countries: ["NL"], currencies: ["EUR"] },
  // Bancontact: { countries: ["BE"], currencies: ["EUR"] },
  // Eps: { countries: ["AT"], currencies: ["EUR"] },
  // MyBank: { countries: ["IT"], currencies: ["EUR"] },
  // P24: { countries: ["PL"], currencies: ["EUR", "PLN"] },
  // Blik: { countries: ["PL"], currencies: ["PLN"] },
};

export const getCartIneligibility = (
  paymentMethodType: PayPalPaymentMethodType,
  countryCode: string | undefined,
  currencyCode: string
): "country" | "currency" | null => {
  const { countries, currencies } =
    CART_ELIGIBILITY_BY_PAYMENT_METHOD_TYPE[paymentMethodType] ?? {};
  if (countries && !countries.includes(countryCode ?? "")) return "country";
  if (currencies && !currencies.includes(currencyCode)) return "currency";
  return null;
};
