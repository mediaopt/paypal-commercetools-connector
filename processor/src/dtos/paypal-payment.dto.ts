import { Static, Type } from "@sinclair/typebox";

type ValuesOf<T extends object> = T[keyof T];

export const StandardPaymentMethodType = {
  CREDIT_CARD: "CardFields",
  PAYPAL: "PayPal",
} as const;
export type StandardPaymentMethodType = ValuesOf<
  typeof StandardPaymentMethodType
>;

export const PaymentMethodType = {
  ...StandardPaymentMethodType,
} as const;
export type PaymentMethodType = StandardPaymentMethodType;

export enum CustomBuilderType {
  EXPRESS = "express",
}

// Payment schema groups
const PaymentRequiredFieldsSchema = Type.Object({
  id: Type.String(),
  amountPlanned: Type.Object({
    centAmount: Type.Number(),
    currencyCode: Type.String(),
    fractionDigits: Type.Number(),
  }),
});

const PaymentExpressShippingSchema = Type.Object({
  shippingOptions: Type.Optional(Type.Array(Type.Any())),
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

// Shape must match CreatePaymentResponse in enabler
export const InitPaymentResponseSchema = Type.Intersect([
  Type.Object({
    paypalData: Type.Object({
      clientId: Type.String(),
      currency: Type.String(),
      intent: Type.String(),
    }),
  }),
  PaymentRequiredFieldsSchema,
  PaymentExpressShippingSchema,
  PaymentFrontendRenderingSchema,
  PaymentVaultSchema,
]);

export const InitPaymentRequestSchema = Type.Object({
  paymentMethodType: Type.Enum(PaymentMethodType),
  builderType: Type.Optional(Type.Enum(CustomBuilderType)),
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

// Shape must match CreateOrderRequest in enabler. No paymentVersion field here — the enabler's
// own CreateOrderRequest.paymentVersion is legacy/self-hosted-only and stays undefined against
// this processor (see enabler/src/app/usePayment.tsx); Fastify/AJV's default additionalProperties
// behavior means a caller that still sends it is unaffected by its absence from this schema.
export const CreateOrderRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderData: Type.Optional(CreateOrderDataSchema),
  // Sourced from the enabler's own settings.payPalIntent (already fetched client-side via
  // /operations/config) rather than processor re-fetching settings itself. Defaults to Capture
  // in buildOrderRequest when absent (e.g. an older/self-hosted caller that hasn't sent it yet).
  payPalIntent: Type.Optional(
    Type.Union([Type.Literal("Authorize"), Type.Literal("Capture")])
  ),
});
export type CreateOrderRequestSchemaDTO = Static<
  typeof CreateOrderRequestSchema
>;

// Shape must match CreateOrderResponse in enabler. No paymentVersion field — processor never
// invents/echoes a commercetools version for an entity the fast checkout APIs already manage.
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

// Shape must match the request body enabler's handleAuthenticateThreeDSOrder sends (usePayment.tsx).
// isGPay is accepted for enabler-contract compatibility but not currently branched on

export const AuthenticateThreeDSOrderRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  isGPay: Type.Optional(Type.Boolean()),
});
export type AuthenticateThreeDSOrderRequestSchemaDTO = Static<
  typeof AuthenticateThreeDSOrderRequestSchema
>;

// Shape must match the response enabler's handleAuthenticateThreeDSOrder expects (usePayment.tsx).
// No paymentVersion field — same reasoning as CreateOrderResponseSchema, processor never invents/
// echoes a commercetools version for an entity the fast checkout APIs already manage; the enabler
// no longer reads one from this response either (legacy paymentVersion plumbing, dead everywhere
// in processor already — see the request schema above). `approve` is entirely absent (not just
// empty) when the PayPal order has no authentication_result — the enabler checks for its presence
// via hasOwnProperty.
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

// Shape must match the request body enabler's handleOnApprove sends (usePayment.tsx) — shared by
// both /payments/authorize and /payments/approve, mirroring the enabler's single OnApproveRequest
// type used for both calls. No paymentVersion field — the enabler's own OnApproveRequest.paymentVersion is legacy/self-hosted-only.
export const OnApproveRequestSchema = Type.Object({
  paymentId: Type.String(),
  orderID: Type.String(),
  // Accepted for enabler-contract compatibility; not yet acted on — no CT-native PaymentMethod
  // "save" flow exists yet.
  saveCard: Type.Optional(Type.Boolean()),
});
export type OnApproveRequestSchemaDTO = Static<typeof OnApproveRequestSchema>;

// Shape must match the enabler's OnApproveResponse.orderData. Real PayPal status/message are
// passed through unmodified — the enabler checks orderData.status === "COMPLETED" directly.
export const OnApproveResponseSchema = Type.Object({
  orderData: Type.Object({
    id: Type.String(),
    status: Type.String(),
    message: Type.Optional(Type.String()),
  }),
});
export type OnApproveResponseSchemaDTO = Static<typeof OnApproveResponseSchema>;
