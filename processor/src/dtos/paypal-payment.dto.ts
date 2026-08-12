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

// Shape must match CreateOrderRequest in enabler
export const CreateOrderRequestSchema = Type.Object({
  paymentId: Type.String(),
  paymentVersion: Type.Optional(Type.Number()), // accepted, never used — dead everywhere else in processor
  orderData: Type.Optional(CreateOrderDataSchema),
});
export type CreateOrderRequestSchemaDTO = Static<typeof CreateOrderRequestSchema>;

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
export type CreateOrderResponseSchemaDTO = Static<typeof CreateOrderResponseSchema>;
