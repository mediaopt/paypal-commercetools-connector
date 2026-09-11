import { Cart, Payment } from "@commercetools/connect-payments-sdk";
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
  mapCommercetoolsMoneyToPayPalMoney,
  findMostRecentTransaction,
  CheckoutPaymentIntent,
  OrderRequest,
  PurchaseUnitRequest,
} from "common-connect";
import { CreateOrderRequestSchemaDTO } from "../dtos/paypal-payment.dto";
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
  cancelUrl?: string
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
        false, // TODO: make configurable when working on PUI
        ctCart.lineItems,
        ctCart.locale
      ) ?? undefined,
  } as PurchaseUnitRequest;

  const experienceContext = {
    ...(returnUrl ? { return_url: returnUrl } : {}),
    ...(cancelUrl ? { cancel_url: cancelUrl } : {}),
    ...(showContinueReview ? { user_action: "CONTINUE" as const } : {}),
    ...(shipping && !isExpress
      ? { shipping_preference: "SET_PROVIDED_ADDRESS" as const }
      : {}),
  };

  return {
    intent:
      payPalIntent === "Authorize"
        ? CheckoutPaymentIntent.Authorize
        : CheckoutPaymentIntent.Capture,
    purchase_units: [purchaseUnit],
    ...(orderData?.paymentSource === "paypal"
      ? {
          payment_source: {
            paypal: {
              ...(Object.keys(experienceContext).length
                ? { experience_context: experienceContext }
                : {}),
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
  };
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
