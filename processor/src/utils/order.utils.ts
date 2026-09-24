import { Cart, Payment } from "@commercetools/connect-payments-sdk";
import { Transaction } from "@commercetools/platform-sdk";
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

// PAYPAL_ORDER_EXPERIENCE_CONTEXT is shared by both payment sources, but PayPal rejects keys that
// don't belong to the one it's sent with
const PAYPAL_WALLET_EXPERIENCE_CONTEXT_KEYS: Array<
  keyof NonNullable<PaypalWallet["experience_context"]>
> = [
  "brand_name",
  "locale",
  "shipping_preference",
  "return_url",
  "cancel_url",
  "landing_page",
  "user_action",
  "payment_method_preference",
];
const PAY_UPON_INVOICE_EXPERIENCE_CONTEXT_KEYS = [
  "brand_name",
  "locale",
  "logo_url",
  "customer_service_instructions",
];

const pickExperienceContextOverrides = (
  overrides: Record<string, unknown>,
  keys: string[]
) =>
  Object.fromEntries(
    Object.entries(overrides).filter(([key]) => keys.includes(key))
  );

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
        ctCart.locale,
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
    ...pickExperienceContextOverrides(
      experienceContextOverrides,
      PAYPAL_WALLET_EXPERIENCE_CONTEXT_KEYS
    ),
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
                ...pickExperienceContextOverrides(
                  experienceContextOverrides,
                  PAY_UPON_INVOICE_EXPERIENCE_CONTEXT_KEYS
                ),
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
  fallbackFractionDigits?: number, //fallbackFractionDigits` is for Payment Intents API
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

const PAYPAL_ORDER_PLACEHOLDER_PREFIX = "PayPalOrderId: ";

// The only case in this codebase where a transaction's interactionId is not a real PSP transaction
// id — addApprovalPlaceholderTransaction() (paypal-payment.service.ts) marks its placeholder this
// way, using the PayPal order id (the only identifier available before a real authorize/capture
// happens), so it can never be mistaken for — or accidentally reused as — a genuine PayPal
// authorization/capture id. Always find/exclude the placeholder via isPlaceholderInteractionId()
// below, never by comparing interactionId against a specific order id.
export const buildPlaceholderInteractionId = (orderID: string): string =>
  `${PAYPAL_ORDER_PLACEHOLDER_PREFIX}${orderID}`;

export const isPlaceholderInteractionId = (interactionId?: string): boolean =>
  !!interactionId?.startsWith(PAYPAL_ORDER_PLACEHOLDER_PREFIX);

/**
 * Finds the interactionId (PayPal authorization id) of the payment's most recent Authorization/
 * Success transaction — the transaction lookup itself is shared with paypal-commercetools-
 * extension's findSuitableTransactionId (see common-connect's findMostRecentTransaction); the
 * error type/messages here are processor-specific.
 * Used by settlement() to capture an authorization added earlier by authorizeOrder(). The
 * Success-state filter already excludes addApprovalPlaceholderTransaction()'s Pending placeholder
 * (see isPlaceholderInteractionId above), so no extra guard is needed here.
 */
export const findAuthorizationTransactionId = (payment: Payment): string => {
  const transaction = findMostRecentTransaction(
    payment,
    "Authorization",
    "Success",
  );
  if (!transaction) {
    throw new ErrorInvalidOperation(
      `Payment ${payment.id} has no Authorization/Success transaction to capture`,
    );
  }
  if (!transaction.interactionId) {
    throw new ErrorInvalidOperation(
      `Payment ${payment.id}'s Authorization transaction has no interactionId`,
    );
  }
  return transaction.interactionId;
};

/**
 * Resolves the interactionId (PayPal capture id) of the Charge transaction to refund, and throws
 * the appropriate ErrorInvalidOperation when none qualifies.
 *
 * - With a transactionId: that exact transaction must exist and be a successful Charge.
 * - Without one: falls back to the most recent successful Charge. This codebase only ever creates
 *   a single Charge per payment, so this doesn't distinguish "never refunded" from "partially
 *   refunded" — callers that need to stop at a remaining balance (e.g. a full reversal) should use
 *   findCapturedChargeBalance() instead, which does track that.
 *
 * Used by refundPayment().
 */
export const findRefundableTransactionId = (
  payment: Payment,
  transactionId?: string,
): string => {
  if (transactionId) {
    const transaction = payment.transactions.find(
      (t) => t.id === transactionId,
    );
    if (!transaction) {
      throw new ErrorInvalidOperation(
        `TransactionId ${transactionId} is not found.`,
      );
    }
    if (transaction.type !== "Charge" || transaction.state !== "Success") {
      throw new ErrorInvalidOperation(
        `TransactionId ${transactionId} is not refundable`,
      );
    }
    if (!transaction.interactionId) {
      throw new ErrorInvalidOperation(
        `No refundable transaction found for payment ${payment.id}`,
      );
    }
    return transaction.interactionId;
  }

  const transaction = findMostRecentTransaction(payment, "Charge", "Success");
  if (!transaction || !transaction.interactionId) {
    throw new ErrorInvalidOperation(
      `No refundable transaction found for payment ${payment.id}`,
    );
  }
  return transaction.interactionId;
};

// Shared by findVoidableTransaction()'s alreadyCaptured check and findCapturedChargeBalance()
// below — capture creates a Charge with its own PayPal capture id, not the authorization's
// interactionId, so there's no direct reference from an Authorization to check; a successful
// Charge existing at all is what "the authorization behind it is gone" is based on.
const hasCapturedCharge = (payment: Payment): boolean =>
  payment.transactions.some((t) => t.type === "Charge" && t.state === "Success");

/**
 * Resolves the payment's captured Charge together with how much of it hasn't been refunded yet
 * (its amount minus any successful Refunds already applied). Returns undefined when the payment
 * hasn't been captured at all.
 *
 * settlement() supports capturing an authorization in installments (PayPal captures default to
 * final_capture: false), so a payment can end up with more than one successful Charge — this
 * function only knows how to reverse a single capture (PayPal's refund call targets one specific
 * capture id), so it throws rather than silently refunding just one of several captures while
 * reporting the payment as fully reversed. Used by reversePayment's void-vs-refund routing
 * (abstract-payment.service.ts).
 */
export const findCapturedChargeBalance = (
  payment: Payment,
): { transaction: Transaction; remainingAmount: number } | undefined => {
  const chargeTransactions = payment.transactions.filter(
    (t) => t.type === "Charge" && t.state === "Success",
  );
  if (chargeTransactions.length === 0) {
    return undefined;
  }
  if (chargeTransactions.length > 1) {
    throw new ErrorInvalidOperation(
      `Payment ${payment.id} has more than one captured Charge — reversePayment doesn't support reversing multiple captures; refund each one individually via refundPayment with its transactionId`,
    );
  }
  const [transaction] = chargeTransactions;
  const refundedCentAmount = payment.transactions
    .filter((t) => t.type === "Refund" && t.state === "Success")
    .reduce((sum, t) => sum + t.amount.centAmount, 0);
  return {
    transaction,
    remainingAmount: transaction.amount.centAmount - refundedCentAmount,
  };
};

/**
 * Finds the Authorization transaction to void — the most recent successful Authorization,
 * excluding one that's already been voided (its own CT state stays "Success" even after voiding,
 * since CancelAuthorization is recorded as a separate transaction) or already captured (see
 * hasCapturedCharge above). Throws ErrorInvalidOperation when none qualifies. Used by void().
 */
export const findVoidableTransaction = (
  payment: Payment,
): Transaction & { interactionId: string } => {
  if (hasCapturedCharge(payment)) {
    throw new ErrorInvalidOperation(
      `No voidable transaction found for payment ${payment.id}`,
    );
  }

  const voidedInteractionIds = new Set(
    payment.transactions
      .filter((t) => t.type === "CancelAuthorization" && t.state === "Success")
      .map((t) => t.interactionId),
  );
  const transaction = payment.transactions
    .filter(
      (t) =>
        t.type === "Authorization" &&
        t.state === "Success" &&
        !voidedInteractionIds.has(t.interactionId),
    )
    .at(-1);

  if (!transaction || !transaction.interactionId) {
    throw new ErrorInvalidOperation(
      `No voidable transaction found for payment ${payment.id}`,
    );
  }
  return transaction as Transaction & { interactionId: string };
};
