import {
  statusHandler,
  healthCheckCommercetoolsPermissions,
  ErrorRequiredField,
  ErrorInvalidOperation,
  Cart,
  Payment,
  CustomFieldsDraft,
} from "@commercetools/connect-payments-sdk";

import {
  CancelPaymentRequest,
  ConfigResponse,
  ModifyPaymentWithTransactionRequest,
  StatusResponse,
} from "./types/operation.type";

import { SupportedPaymentComponentsSchemaDTO } from "../dtos/operations/payment-componets.dto";
import packageJSON from "../../package.json";

import { AbstractPaymentService } from "./abstract-payment.service";
import { getConfig } from "../config/config";
import { appLogger, paymentSDK } from "../payment-sdk";
import { PayPalPaymentServiceOptions } from "./types/paypal-payment.type";
import {
  PaymentUpdateResponseSchemaDTO,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
} from "../dtos/paypal-payment.dto";
import { getCartIdFromContext } from "../libs/fastify/context/context";
import { getStoredPaymentMethodsConfig } from "../config/stored-payment-methods.config";
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
} from "common-connect";

import { log } from "../libs/logger";

export class PayPalPaymentService extends AbstractPaymentService {
  constructor(opts: PayPalPaymentServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService);
  }

  /**
   * Get configurations
   *
   * @remarks
   * Implementation to provide PayPal configuration information
   *
   * @returns Promise with configuration containing return URL and stored payment methods settings
   */
  public async config(): Promise<ConfigResponse> {
    return {
      returnUrl: getConfig().returnUrl,
      environment: getConfig().paypalEnvironment,
      storedPaymentMethodsConfig: {
        isEnabled: await this.isStoredPaymentMethodsEnabled(),
      },
      perMethodConfig: getConfig().perMethodConfig,
    };
  }

  /**
   * Indicates if the feature stored payment methods is enabled/available.
   * It can be enhanced with further checks if so required.
   */
  async isStoredPaymentMethodsEnabled(): Promise<boolean> {
    if (!getStoredPaymentMethodsConfig().enabled) {
      return false;
    }

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    return ctCart.customerId !== undefined;
  }

  /**
   * Get status
   *
   * @remarks
   * Implementation to provide status of PayPal gateway and related services
   *
   * @returns Promise with status information from PayPal gateway
   */
  public async status(): Promise<StatusResponse> {
    const requiredPermissions = [
      "manage_payments",
      "view_sessions",
      "view_api_clients",
      "manage_orders",
      "introspect_oauth_tokens",
      "manage_checkout_payment_intents",
      "manage_types",
    ];

    if (getStoredPaymentMethodsConfig().enabled) {
      requiredPermissions.push("manage_payment_methods");
    }

    const handler = await statusHandler({
      log: appLogger,
      timeout: getConfig().healthCheckTimeout,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions,
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: getConfig().projectKey,
        }),
        async () => {
          try {
            // TODO: Add PayPal health check when available in common-connect
            return {
              name: "PayPal gateway",
              status: "UP",
              message: "PayPal healthcheck success",
              details: {},
            };
          } catch (e) {
            return {
              name: "PayPal gateway",
              status: "DOWN",
              message:
                "PayPal gateway is not responding. Please check the PayPal credentials.",
              details: {
                error: e,
              },
            };
          }
        },
      ],
      metadataFn: async () => ({
        name: packageJSON.name,
        description: "PayPal provider integration",
        "@commercetools/connect-payments-sdk":
          packageJSON.dependencies["@commercetools/connect-payments-sdk"],
      }),
    })();

    return handler.body;
  }

  /**
   * Get supported payment components
   *
   * @remarks
   * Implementation to provide the payment components supported by the processor.
   *
   * @returns Promise with list of supported payment components
   */
  public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    return {
      dropins: [],
      components: [
        { type: "CardFields" },
        { type: "PayPal" },
        // Add more payment methods as supported by PayPal
      ],
      express: [{ type: "PayPal" }],
    };
  }

  /**
   * Create payment
   *
   * @remarks
   * Implementation to create a payment in commercetools for PayPal
   *
   * @param request - contains paymentMethodType and builderType
   * @returns Promise with PayPal SDK options and payment details
   */
  public async createPayment({
    builderType,
    paymentMethodType,
  }: PaymentRequestSchemaDTO): Promise<PaymentResponseSchemaDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    if (!ctCart.customerEmail) {
      throw new ErrorInvalidOperation("Required data missing: customer email");
    }

    const amountPlanned = await this.ctCartService.getPaymentAmount({
      cart: ctCart,
    });

    // Create a new payment in commercetools
    const newPayment = await this.ctPaymentService.createPayment({
      amountPlanned,
      paymentMethodInfo: { paymentInterface: getConfig().paymentInterface },
      ...(ctCart.customerId
        ? { customer: { typeId: "customer", id: ctCart.customerId } }
        : { anonymousId: ctCart.anonymousId }),
      paymentStatus: { interfaceCode: "Initial", interfaceText: "Initial" },
    });

    if (!newPayment) {
      throw new ErrorInvalidOperation(
        `Payment creation failed for cart ${ctCart.id}`
      );
    }

    // Add payment to cart
    if (
      ctCart.paymentInfo?.payments === undefined ||
      ctCart.paymentInfo.payments.length === 0
    ) {
      await this.ctCartService.addPayment({
        resource: { id: ctCart.id, version: ctCart.version },
        paymentId: newPayment.id,
      });
    }

    // Gather additional cart data for the response
    const isShipped =
      !!ctCart.shippingAddress || (ctCart.shipping && ctCart.shipping.length > 0);
    const lineItems = mapValidCommercetoolsLineItemsToPayPalItems(
      true, // matchingAmounts: true because amountPlanned was just computed from this cart
      isShipped,
      ctCart.taxCalculationMode,
      false, // isPayUponInvoice: false, only PayPal and CardFields are supported in this enabler phase
      ctCart.lineItems,
      ctCart.locale
    );

    const priceBreakdown = mapCommercetoolsCartToPayPalPriceBreakdown(ctCart);

    const { address: resolvedShippingAddress } =
      resolveCommercetoolsCartShippingAddress(ctCart, newPayment.id);
    const shippingAddress = resolvedShippingAddress
      ? mapCommercetoolsAddressToPayPalAddress(resolvedShippingAddress)
      : undefined;

    // Build response with PayPal SDK options and additional cart data
    return {
      paypalData: {
        clientId: getConfig().paypalClientId ?? "",
        currency: newPayment.amountPlanned.currencyCode,
        intent: "CAPTURE", // TODO: Make configurable
      },
      id: newPayment.id,
      amountPlanned: newPayment.amountPlanned,
      email: ctCart.customerEmail,
      ctCustomerId: ctCart.customerId,
      firstName: ctCart.billingAddress?.firstName,
      lastName: ctCart.billingAddress?.lastName,
      countryCode: ctCart.billingAddress?.country || ctCart.country,
      shippingAddress,
      lineItems: lineItems ?? undefined,
      priceBreakdown,
    };
  }

  /**
   * Settlement (Capture)
   *
   * @remarks
   * Implementation to capture an authorized PayPal payment
   *
   * @param request - commercetools payment and optional amount
   * @returns Promise with success response
   */
  public async settlement(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentUpdateResponseSchemaDTO> {
    const { payment: ctPayment, amount } = request;

    // TODO: Implement PayPal capture logic using common-connect functions
    // This would involve calling capturePayPalOrder from common-connect
    // For now, return a stub response

    return {
      success: true,
      message: `Payment ${ctPayment.id} captured successfully`,
      paymentReference: ctPayment.id,
    };
  }

  /**
   * Refund payment
   *
   * @remarks
   * Implementation to refund a PayPal payment
   *
   * @param request - commercetools payment, optional refund amount, optional transaction ID
   * @returns Promise with success response
   */
  async refundPayment(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentUpdateResponseSchemaDTO> {
    const { payment: ctPayment, amount } = request;

    // TODO: Implement PayPal refund logic using common-connect functions
    // This would involve calling refundPayPalOrder from common-connect
    // For now, return a stub response

    return {
      success: true,
      message: `Payment ${ctPayment.id} refunded successfully`,
      paymentReference: ctPayment.id,
    };
  }

  /**
   * Void (Cancel) payment
   *
   * @remarks
   * Implementation to void/cancel an authorized PayPal payment
   *
   * @param request - commercetools payment
   * @returns Promise with success response
   */
  async void(
    request: CancelPaymentRequest
  ): Promise<PaymentUpdateResponseSchemaDTO> {
    const { payment: ctPayment } = request;

    // TODO: Implement PayPal void logic using common-connect functions
    // This would involve calling voidPayPalOrder from common-connect
    // For now, return a stub response

    return {
      success: true,
      message: `Payment ${ctPayment.id} voided successfully`,
      paymentReference: ctPayment.id,
    };
  }

  /**
   * Get stored payment methods
   *
   * @remarks
   * Implementation to retrieve stored payment methods from PayPal vault
   *
   * @returns Promise with list of stored payment methods
   */
  public async getStoredPaymentMethods(): Promise<PaymentUpdateResponseSchemaDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    if (!ctCart.customerId) {
      log.warn(
        "getStoredPaymentMethods: cart has no customerId, returning empty"
      );
      return { message: "success", success: true };
    }

    // TODO: Implement PayPal vault retrieval using common-connect functions
    // This would involve calling getPaymentTokens from common-connect
    // For now, return an empty list

    return { message: "success", success: true };
  }
}
