import { Cart, Payment } from '@commercetools/connect-payments-sdk';
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
  mapCommercetoolsMoneyToPayPalMoney,
  CheckoutPaymentIntent,
  OrderRequest,
  PurchaseUnitRequest,
} from 'common-connect';
import { CreateOrderRequestSchemaDTO } from '../dtos/paypal-payment.dto';

/**
 * Builds the PayPal OrderRequest for createOrder from the commercetools payment/cart.
 * Only paymentSource === "paypal" is functionally wired to a real payment_source — other
 * funding sources (kept in the request type for future payment methods) omit
 * payment_source entirely and let PayPal default.
 */
export const buildOrderRequest = (
  payment: Payment,
  ctCart: Cart,
  orderData?: CreateOrderRequestSchemaDTO['orderData'],
): OrderRequest => {
  const { address: resolvedShippingAddress } = resolveCommercetoolsCartShippingAddress(ctCart, payment.id);
  const shipping = resolvedShippingAddress ? mapCommercetoolsAddressToPayPalAddress(resolvedShippingAddress) : undefined;
  const isShipped = !!ctCart.shippingAddress || (ctCart.shipping && ctCart.shipping.length > 0);
  const relevantCartCost = ctCart.taxedPrice?.totalGross ?? ctCart.totalPrice;
  const matchingAmounts = payment.amountPlanned.centAmount === relevantCartCost?.centAmount;

  // mapCommercetoolsAddressToPayPalAddress's return type isn't narrowed to ShippingDetail
  // (its `type` field is inferred as `string`) — same looseness createPayment already
  // lives with for this helper; cast at the edge like the extension does.
  const purchaseUnit = {
    amount: {
      currency_code: payment.amountPlanned.currencyCode,
      value: mapCommercetoolsMoneyToPayPalMoney(payment.amountPlanned),
      breakdown: matchingAmounts ? mapCommercetoolsCartToPayPalPriceBreakdown(ctCart) : undefined,
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
        ctCart.locale,
      ) ?? undefined,
  } as PurchaseUnitRequest;

  return {
    intent: CheckoutPaymentIntent.Capture, // TODO: Make configurable — same existing gap as createPayment's response
    purchase_units: [purchaseUnit],
    ...(orderData?.paymentSource === 'paypal'
      ? {
          payment_source: {
            paypal: {
              ...(shipping
                ? {
                    experience_context: {
                      shipping_preference: 'SET_PROVIDED_ADDRESS' as const,
                    },
                  }
                : {}),
              ...(orderData?.storeInVault
                ? {
                    attributes: {
                      vault: {
                        store_in_vault: 'ON_SUCCESS' as const,
                        usage_type: 'MERCHANT' as const,
                      },
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
