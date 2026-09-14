import { Cart, Payment } from "@commercetools/connect-payments-sdk";
import { TransactionState } from "@commercetools/platform-sdk";
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
  mapCommercetoolsMoneyToPayPalMoney,
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  findMostRecentTransaction,
  CheckoutPaymentIntent,
  OrderRequest,
  PurchaseUnitRequest,
  PaypalWallet,
  Authorization2StatusEnum,
  Capture2StatusEnum,
} from "common-connect";
import {
  CreateOrderRequestSchemaDTO,
  StandardPaymentMethodType,
} from "../dtos/paypal-payment.dto";
import { ErrorInvalidOperation } from "@commercetools/connect-payments-sdk";

/**
 * Builds the PayPal OrderRequest for createOrder from the commercetools payment/cart.
 * Only paymentSource === "paypal"/"card" are functionally wired to a real payment_source — other
 * funding sources (kept in the request type for future payment methods) omit
 * payment_source entirely and let PayPal default.
 *
 * The last argument, existingPayPalCustomerId, is the CT customer's existing PayPal customer id
 * (custom.fields.PayPalUserId), when known — see paypal-payment.service.ts's createOrder().
 * Without this, vaulting a new payment source for a returning customer mints PayPal a brand-new,
 * disconnected customer id instead of adding to their existing one, since a card has no
 * OAuth/login step of its own to let PayPal infer the link the way payment_source.paypal's
 * buyer-login flow can.
 */
// Shared by the paypal/card vault branches below — see buildOrderRequest's docblock for why
// existingPayPalCustomerId matters.
const buildVaultCustomerAttributes = (existingPayPalCustomerId?: string) =>
  existingPayPalCustomerId
    ? { customer: { id: existingPayPalCustomerId } }
    : {};

// PayPal requires payment_source.pay_upon_invoice.experience_context.locale — omitting it doesn't
// 400 at the schema level, it instead fails RatePay's own business validation with a generic
// PAYMENT_SOURCE_CANNOT_BE_USED (422) pointing at this field. ctCart.locale is frequently unset
// (it's optional on a commercetools Cart), so this is the fallback then — RatePay/PUI is a
// DACH-region product only (matches the enabler's own default +49 phone prefix), so "de-DE" is a
// reasonable default rather than guessing from country_code.
const PAY_UPON_INVOICE_DEFAULT_LOCALE = "de-DE";

// PayPal requires payment_source.pay_upon_invoice.experience_context.customer_service_instructions
// (400s with MISSING_REQUIRED_PARAMETER otherwise) — merchant-facing text shown to the buyer for
// how to reach support about their RatePay invoice. Placeholder default; override via
// PAYPAL_ORDER_EXPERIENCE_CONTEXT (see .env.template) — the merchant must set a real one.
const PAY_UPON_INVOICE_CUSTOMER_SERVICE_INSTRUCTIONS = [
  "It is merchant responsibility to set this message.",
];

export const buildOrderRequest = (
  payment: Payment,
  ctCart: Cart,
  orderData?: CreateOrderRequestSchemaDTO["orderData"],
  payPalIntent?: CreateOrderRequestSchemaDTO["payPalIntent"],
  existingPayPalCustomerId?: string,
  isExpress?: boolean,
  // Whether to show PayPal's "Continue to Review Order" flow (see experience_context.user_action
  // below) — must match the client-side `commit` script option the enabler actually rendered for
  // this component (both derived from the same PayPalPaymentService.hasExpressReviewStep(), see
  // that method's own comment). Only ever true for Express with an actual review step configured
  // (PAYPAL_REDIRECT_ON_APPROVE/PAYPAL_ONAPPROVE_PREFIX).
  showContinueReview = false,
  // Same merchant-return-url chain buildRedirectMerchantUrl uses for the post-approval buyer
  // redirect (paypal-payment.service.ts) — undefined when neither MERCHANT_RETURN_URL nor a
  // session return url is configured, in which case the corresponding experience_context field is
  // simply omitted below.
  returnUrl?: string,
  cancelUrl?: string,
  // getConfig().orderExperienceContext (PAYPAL_ORDER_EXPERIENCE_CONTEXT) — merchant JSON overrides
  // spread over this function's own computed experience_context defaults below, so an explicit key
  // here (e.g. user_action, payment_method_preference) always wins, including over showContinueReview.
  experienceContextOverrides: Record<string, unknown> = {},
  paymentMethodType?: CreateOrderRequestSchemaDTO["paymentMethodType"]
): OrderRequest => {
  const { address: resolvedShippingAddress } =
    resolveCommercetoolsCartShippingAddress(ctCart, payment.id);
  // if shipping address is provided PayPal express doesn't allow to change it
  const shipping =
    resolvedShippingAddress && !isExpress
      ? mapCommercetoolsAddressToPayPalAddress(resolvedShippingAddress)
      : undefined;
  const isShipped =
    !!ctCart.shippingAddress || (ctCart.shipping && ctCart.shipping.length > 0);
  const relevantCartCost = ctCart.taxedPrice?.totalGross ?? ctCart.totalPrice;
  const matchingAmounts =
    payment.amountPlanned.centAmount === relevantCartCost?.centAmount;

  // mapCommercetoolsAddressToPayPalAddress's return type isn't narrowed to ShippingDetail
  // (its `type` field is inferred as `string`) — same looseness createPayment already
  // lives with for this helper; cast at the edge like the extension does.
  const purchaseUnit = {
    amount: {
      ...buildPayPalAmount(payment.amountPlanned),
      breakdown: matchingAmounts
        ? mapCommercetoolsCartToPayPalPriceBreakdown(ctCart)
        : undefined,
    },
    shipping,
    invoice_id: payment.id,
    items:
      mapValidCommercetoolsLineItemsToPayPalItems(
        matchingAmounts,
        isShipped,
        ctCart.taxCalculationMode,
        paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE,
        ctCart.lineItems,
        ctCart.locale
      ) ?? undefined,
  } as PurchaseUnitRequest;

  const experienceContext = {
    ...(returnUrl ? { return_url: returnUrl } : {}),
    ...(cancelUrl ? { cancel_url: cancelUrl } : {}),
    user_action: showContinueReview
      ? ("CONTINUE" as const)
      : ("PAY_NOW" as const),
    payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED" as const,
    ...(shipping && !isExpress
      ? { shipping_preference: "SET_PROVIDED_ADDRESS" as const }
      : {}),
    ...experienceContextOverrides,
  } as PaypalWallet["experience_context"];

  const result = {
    intent:
      paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE
        ? CheckoutPaymentIntent.Capture
        : payPalIntent === "Authorize"
        ? CheckoutPaymentIntent.Authorize
        : CheckoutPaymentIntent.Capture,
    ...(paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE
      ? {
          processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL" as const,
        }
      : {}),
    purchase_units: [purchaseUnit],
    ...(orderData?.paymentSource === "paypal"
      ? {
          payment_source: {
            paypal: {
              experience_context: experienceContext,
              ...(orderData?.storeInVault
                ? {
                    attributes: {
                      vault: {
                        store_in_vault: "ON_SUCCESS" as const,
                        usage_type: "MERCHANT" as const,
                      },
                      ...buildVaultCustomerAttributes(existingPayPalCustomerId),
                    },
                  }
                : {}),
              ...(orderData?.vaultId ? { vault_id: orderData.vaultId } : {}),
            },
          },
        }
      : {}),
    ...(orderData?.paymentSource === "card"
      ? {
          payment_source: {
            // No card number/expiry/cvv here — Card Fields collects those directly in the
            // browser and attaches them via its own confirm-payment-source call after this
            // order is created. Only vaulting instructions are relevant server-side.
            card: {
              ...(orderData?.storeInVault
                ? {
                    attributes: {
                      vault: {
                        store_in_vault: "ON_SUCCESS" as const,
                      },
                      ...buildVaultCustomerAttributes(existingPayPalCustomerId),
                    },
                  }
                : {}),
              ...(orderData?.vaultId ? { vault_id: orderData.vaultId } : {}),
            },
          },
        }
      : {}),
    ...(paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE
      ? {
          payment_source: {
            pay_upon_invoice: {
              email: ctCart.customerEmail,
              name: {
                given_name: ctCart.billingAddress?.firstName,
                surname: ctCart.billingAddress?.lastName,
              },
              ...(ctCart.billingAddress
                ? {
                    // PayPal's pay_upon_invoice.billing_address is a flat Address — unlike
                    // `shipping` above, it does NOT take the {type, name, address} ShippingDetail
                    // wrapper mapCommercetoolsAddressToPayPalAddress returns, so only its nested
                    // `address` is used here (PayPal 400s with "billing_address/country_code must
                    // not be null" otherwise, since it never sees country_code at the level it
                    // expects).
                    billing_address: mapCommercetoolsAddressToPayPalAddress(
                      ctCart.billingAddress
                    )?.address,
                  }
                : {}),
              phone: {
                country_code: orderData?.countryCode,
                national_number: orderData?.nationalNumber,
              },
              birth_date: orderData?.birthDate,
              // customer_service_instructions/locale are placeholder defaults — merchant-
              // configurable via the same PAYPAL_ORDER_EXPERIENCE_CONTEXT env var used for the
              // generic wallet experience_context above (e.g.
              // {"customer_service_instructions":["Contact us at support@mystore.example"]});
              // an explicit key there always wins, same convention as experienceContext.
              experience_context: {
                customer_service_instructions:
                  PAY_UPON_INVOICE_CUSTOMER_SERVICE_INSTRUCTIONS,
                locale: ctCart.locale ?? PAY_UPON_INVOICE_DEFAULT_LOCALE,
                ...experienceContextOverrides,
              },
            },
          } as any,
        }
      : {}),
  } as any;

  return result as OrderRequest;
};

export const buildPayPalAmount = (
  amount: { currencyCode: string; centAmount: number; fractionDigits?: number },
  fallbackFractionDigits?: number //fallbackFractionDigits` is for Payment Intents API
): { currency_code: string; value: string } => ({
  currency_code: amount.currencyCode,
  value: mapCommercetoolsMoneyToPayPalMoney({
    type: "centPrecision",
    currencyCode: amount.currencyCode,
    centAmount: amount.centAmount,
    fractionDigits: amount.fractionDigits ?? fallbackFractionDigits ?? 0,
  }),
});

// Extracts the authorization/capture sub-object PayPal attaches to an Order response's first
// purchase unit — shared with paypal-commercetools-extension, see common-connect's map.utils.ts.
export { extractPayPalPurchaseUnitTransaction } from "common-connect";

export type PayPalOrderTransactionConfig = {
  purchaseUnitKey: "authorizations" | "captures";
  transactionType: "Authorization" | "Charge";
  mapStatus: (status?: string) => TransactionState;
};

// The only two fixed shapes an authorize/capture-outcome transaction can take, keyed by PayPal intent
const PAYPAL_INTENT_TRANSACTION_CONFIG: Record<
  "Authorize" | "Capture",
  PayPalOrderTransactionConfig
> = {
  Authorize: {
    purchaseUnitKey: "authorizations",
    transactionType: "Authorization",
    mapStatus: (status) =>
      mapPayPalAuthorizationStatusToCommercetoolsTransactionState(
        status as Authorization2StatusEnum | undefined
      ),
  },
  Capture: {
    purchaseUnitKey: "captures",
    transactionType: "Charge",
    mapStatus: (status) =>
      mapPayPalCaptureStatusToCommercetoolsTransactionState(
        status as Capture2StatusEnum | undefined
      ),
  },
};

export const resolvePayPalIntentTransactionConfig = (
  payPalIntent?: string
): PayPalOrderTransactionConfig =>
  PAYPAL_INTENT_TRANSACTION_CONFIG[
    payPalIntent === "Authorize" ? "Authorize" : "Capture"
  ];

/**
 * Finds the interactionId (PayPal authorization id) of the payment's most recent Authorization/
 * Success transaction — the transaction lookup itself is shared with paypal-commercetools-
 * extension's findSuitableTransactionId (see common-connect's findMostRecentTransaction); the
 * error type/messages here are processor-specific.
 * Used by settlement() to capture an authorization added earlier by authorizeOrder().
 */
export const findAuthorizationTransactionId = (payment: Payment): string => {
  const transaction = findMostRecentTransaction(
    payment,
    "Authorization",
    "Success"
  );
  if (!transaction) {
    throw new ErrorInvalidOperation(
      `Payment ${payment.id} has no Authorization/Success transaction to capture`
    );
  }
  if (!transaction.interactionId) {
    throw new ErrorInvalidOperation(
      `Payment ${payment.id}'s Authorization transaction has no interactionId`
    );
  }
  return transaction.interactionId;
};
