import { Static, Type } from "@sinclair/typebox";

type ValuesOf<T extends object> = T[keyof T];

export const StandardPaymentMethodType = {
  CREDIT_CARD: "CardFields",
  PAYPAL: "PayPal",

  // TODO: implement ApplePay support once this connector is fully Checkout-compatible.
  // APPLE_PAY: "ApplePay",
  // TODO: implement GooglePay support once this connector is fully Checkout-compatible.
  // GOOGLE_PAY: "GooglePay",
  // Venmo has no commercetools Checkout equivalent — not available in commercetools itself.
  // VENMO: "Venmo",
  // PayUponInvoice has no commercetools Checkout equivalent — not available in commercetools itself.
  // PAY_UPON_INVOICE: "PayUponInvoice",
} as const;
export type StandardPaymentMethodType = ValuesOf<
  typeof StandardPaymentMethodType
>;

export const PaymentMethodType = {
  ...StandardPaymentMethodType,
} as const;
export type PaymentMethodType = StandardPaymentMethodType;

export const CustomBuilderType = {
  EXPRESS: "express",
} as const;
export type CustomBuilderType =
  (typeof CustomBuilderType)[keyof typeof CustomBuilderType];

// Payment schema groups
const PaymentRequiredFieldsSchema = Type.Object({
  id: Type.String(),
  amountPlanned: Type.Object({
    centAmount: Type.Number(),
    currencyCode: Type.String(),
    fractionDigits: Type.Number(),
  }),
});

export const PayPalMoneySchema = Type.Object({
  currency_code: Type.String(),
  value: Type.String(),
});

// Shipping option schema — used for both createPayment response and updateShipping flow
export const PayPalShippingOptionSchema = Type.Object({
  id: Type.String(),
  label: Type.String(),
  type: Type.Literal("SHIPPING"),
  amount: PayPalMoneySchema,
  selected: Type.Boolean(),
});
export type PayPalShippingOptionSchemaDTO = Static<
  typeof PayPalShippingOptionSchema
>;

const PaymentExpressShippingSchema = Type.Object({
  shippingOptions: Type.Optional(Type.Array(PayPalShippingOptionSchema)),
});

const PaymentFrontendRenderingSchema = Type.Object({
  email: Type.Optional(Type.String()),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  countryCode: Type.Optional(Type.String()),
  shippingAddress: Type.Optional(Type.Any()),
  lineItems: Type.Optional(Type.Array(Type.Any())),
  priceBreakdown: Type.Optional(Type.Any()),
});

const PaymentVaultSchema = Type.Object({
  ctCustomerId: Type.Optional(Type.String()),
});

// Enabler's CreatePaymentResponse must match this shape.
export const InitPaymentResponseSchema = Type.Intersect([
  Type.Object({
    paypalData: Type.Object({
      clientId: Type.String(),
      currency: Type.String(),
    }),
  }),
  PaymentRequiredFieldsSchema,
  PaymentExpressShippingSchema,
  PaymentFrontendRenderingSchema,
  PaymentVaultSchema,
]);

// Sourced from the enabler's own settings.payPalIntent (already fetched client-side via
// /operations/config) rather than processor re-fetching settings itself. Defaults to Capture.
const PayPalIntentSchema = Type.Optional(
  Type.Union([Type.Literal("Authorize"), Type.Literal("Capture")])
);

export const InitPaymentRequestSchema = Type.Object({
  paymentMethodType: Type.Enum(PaymentMethodType),
  builderType: Type.Optional(Type.String()),
});

export type PaymentRequestSchemaDTO = Static<typeof InitPaymentRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof InitPaymentResponseSchema>;

export const PaymentUpdateResponseSchema = Type.Object({
  message: Type.Optional(Type.String()),
  success: Type.Boolean(),
  paymentReference: Type.Optional(Type.String()),
  merchantReturnUrl: Type.Optional(Type.String()),
});
export type PaymentUpdateResponseSchemaDTO = Static<
  typeof PaymentUpdateResponseSchema
>;

// Mirrors enabler's CreatePayPalOrderData — the full field set is kept for future payment
// methods (see enabler/src/types/index.ts's FUNDING_SOURCE), even though only
// paymentSource === "paypal" is functionally wired up today.
const CreateOrderDataSchema = Type.Object({
  paymentSource: Type.Optional(Type.String()),
  storeInVault: Type.Optional(Type.Boolean()),
  vaultId: Type.Optional(Type.String()),
  verificationMethod: Type.Optional(Type.String()),
  fraudNetSessionId: Type.Optional(Type.String()),
  birthDate: Type.Optional(Type.String()),
  nationalNumber: Type.Optional(Type.String()),
  countryCode: Type.Optional(Type.String()),
});

// Enabler's CreateOrderRequest must match this shape.
export const CreateOrderRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderData: Type.Optional(CreateOrderDataSchema),
  payPalIntent: PayPalIntentSchema,
  builderType: Type.Optional(Type.String()),
});
export type CreateOrderRequestSchemaDTO = Static<
  typeof CreateOrderRequestSchema
>;

// Enabler's CreateOrderResponse must match this shape.
export const CreateOrderResponseSchema = Type.Object({
  orderData: Type.Object({
    id: Type.String(),
    status: Type.String(),
    payment_source: Type.Optional(Type.Any()),
    links: Type.Optional(Type.Array(Type.Any())),
    message: Type.Optional(Type.String()),
  }),
  ok: Type.Optional(Type.Boolean()),
});
export type CreateOrderResponseSchemaDTO = Static<
  typeof CreateOrderResponseSchema
>;

// Enabler's handleAuthenticateThreeDSOrder request body must match this shape (usePayment.tsx).
// isGPay is accepted for enabler-contract compatibility but not currently branched on.
export const AuthenticateThreeDSOrderRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  isGPay: Type.Optional(Type.Boolean()),
});
export type AuthenticateThreeDSOrderRequestSchemaDTO = Static<
  typeof AuthenticateThreeDSOrderRequestSchema
>;

// Enabler's handleAuthenticateThreeDSOrder response must match this shape (usePayment.tsx).
// `approve` is entirely absent (not just empty) when the PayPal order has no
// authentication_result — the enabler checks for its presence via hasOwnProperty.
export const AuthenticateThreeDSOrderResponseSchema = Type.Object({
  approve: Type.Optional(
    Type.Object({
      liability_shift: Type.Optional(Type.String()),
      three_d_secure: Type.Object({
        enrollment_status: Type.Optional(Type.String()),
        authentication_status: Type.Optional(Type.String()),
      }),
    })
  ),
});
export type AuthenticateThreeDSOrderResponseSchemaDTO = Static<
  typeof AuthenticateThreeDSOrderResponseSchema
>;

// Enabler's OnApproveRequest must match this shape (usePayment.tsx) — shared by both
// /payments/authorize and /payments/approve, mirroring the enabler's single OnApproveRequest type
// used for both calls.
export const OnApproveRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  // Accepted for enabler-contract compatibility; not yet acted on — no CT-native PaymentMethod
  // "save" flow exists yet.
  saveCard: Type.Optional(Type.Boolean()),
  // Lets finalizeOrder tell the PayPal Express flow apart, to decide whether to use
  // onApprovePrefix for the response's merchantReturnUrl.
  builderType: Type.Optional(Type.String()),
});
export type OnApproveRequestSchemaDTO = Static<typeof OnApproveRequestSchema>;

// Enabler's OnApproveResponse.orderData must match this shape. Real PayPal status/message are
// passed through unmodified — the enabler checks orderData.status === "COMPLETED" directly.
export const OnApproveResponseSchema = Type.Object({
  orderData: Type.Object({
    id: Type.String(),
    status: Type.String(),
    message: Type.Optional(Type.String()),
  }),
  // Buyer redirect target — see buildRedirectMerchantUrl in paypal-payment.service.ts.
  merchantReturnUrl: Type.Optional(Type.String()),
});
export type OnApproveResponseSchemaDTO = Static<typeof OnApproveResponseSchema>;

// PayPal Express only, gated by PAYPAL_REDIRECT_ON_APPROVE —
// see expressApprove() in paypal-payment.service.ts.
// Called from handleOnApprove at approval time,
export const ExpressApproveRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  // Decides the placeholder transaction's type (Authorization vs Charge) — see
  // expressApprove()'s docblock for why this must match the eventual real transaction's type.
  payPalIntent: PayPalIntentSchema,
});
export type ExpressApproveRequestSchemaDTO = Static<
  typeof ExpressApproveRequestSchema
>;

export const ExpressApproveResponseSchema = Type.Object({
  onApproveRedirectionUrl: Type.Optional(Type.String()),
});
export type ExpressApproveResponseSchemaDTO = Static<
  typeof ExpressApproveResponseSchema
>;

// Update shipping request — used for both address and option changes
// Field names match PayPal's OnShippingAddressChangeData.shippingAddress vocabulary exactly
export const UpdateShippingRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  shippingMethodId: Type.Optional(Type.String()),
  address: Type.Optional(
    Type.Object({
      countryCode: Type.String(),
      postalCode: Type.Optional(Type.String()),
      city: Type.Optional(Type.String()),
      state: Type.Optional(Type.String()),
    })
  ),
  // lets skip re-querying commercetools for the same list it already returned
  shippingOptions: Type.Optional(Type.Array(PayPalShippingOptionSchema)),
});
export type UpdateShippingRequestSchemaDTO = Static<
  typeof UpdateShippingRequestSchema
>;

// Update shipping response — returns the updated shipping options and totals
export const UpdateShippingResponseSchema = Type.Object({
  shippingOptions: Type.Array(PayPalShippingOptionSchema),
  amount: PayPalMoneySchema,
  breakdown: Type.Object({
    item_total: Type.Optional(PayPalMoneySchema),
    shipping: PayPalMoneySchema,
    tax_total: Type.Optional(PayPalMoneySchema),
    discount: Type.Optional(PayPalMoneySchema),
  }),
});
export type UpdateShippingResponseSchemaDTO = Static<
  typeof UpdateShippingResponseSchema
>;
