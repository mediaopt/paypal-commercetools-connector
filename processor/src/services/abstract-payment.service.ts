import {
  CommercetoolsCartService,
  CommercetoolsPaymentService,
  ErrorInvalidOperation,
} from "@commercetools/connect-payments-sdk";
import {
  ModifyPayment,
  ConfigResponse,
  StatusResponse,
  CancelPaymentRequest,
  ModifyPaymentWithTransactionRequest,
} from "./types/operation.type";

import { SupportedPaymentComponentsSchemaDTO } from "../dtos/operations/payment-componets.dto";
import {
  PaymentUpdateResponseSchemaDTO,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
  CreateOrderRequestSchemaDTO,
  CreateOrderResponseSchemaDTO,
  AuthenticateThreeDSOrderRequestSchemaDTO,
  AuthenticateThreeDSOrderResponseSchemaDTO,
  OnApproveRequestSchemaDTO,
  OnApproveResponseSchemaDTO,
  UpdateShippingRequestSchemaDTO,
  UpdateShippingResponseSchemaDTO,
} from "../dtos/paypal-payment.dto";
import { StoredPaymentMethodsResponse } from "../dtos/stored-payment-methods.dto";
import { logger } from "common-connect";
import { findCapturedChargeBalance } from "../utils/order.utils";

/**
 * Abstract base class for payment service implementations.
 *
 * Note on method naming: Some methods have been renamed for clarity to better align with:
 * - PayPal SDK and API documentation
 * - Existing commercetools connector PayPal extension implementation
 * Where applicable, original method names from the commercetools template are noted in individual method comments.
 * Exception: modifyPayment method uses commercetools naming scheme to keep compatibility with https://docs.commercetools.com/checkout/payment-intents-api
 *
 * Note on CoCo stored payment methods - PayPal customer ID is stored on commercetools side.
 * Frontend gets the stored methods on PayPal side by token.
 *
 * Note on class structure - there are 3 groups of methods
 * - operation - general routes required to initialize the client, do not involve payment or customer yet
 * - payment - responsible for actual payment operations, all methods except createPayment require valid payment.
 *   createPayment only creates a commercetools Payment; createOrder is the first method in this group that
 *   calls PayPal and syncs pspReference/status/method onto that payment, but it must never add a transaction —
 *   commercetools Checkout creates the commercetools Order as soon as it observes ANY in-progress transaction
 *   on the payment, so adding one at createOrder time (before the buyer has approved on PayPal) would create a
 *   commercetools Order prematurely. The transaction belongs to the future capture/confirm step (settlement),
 *   once the buyer has actually approved and PayPal's capture call is made. The "PayPal order" (this PSP-side
 *   resource) and the "commercetools Order" (created later by Checkout's own mechanism) are different things.
 * - customer - responsible for vault related operations for CoCo customer. Customer id and version is required for these calls.
 */

export abstract class AbstractPaymentService {
  protected ctCartService: CommercetoolsCartService;
  protected ctPaymentService: CommercetoolsPaymentService;

  protected constructor(
    ctCartService: CommercetoolsCartService,
    ctPaymentService: CommercetoolsPaymentService
  ) {
    this.ctCartService = ctCartService;
    this.ctPaymentService = ctPaymentService;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * OPERATION HANDLERS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Get system configuration, status, and supported payment components
   */

  /**
   * Get configurations
   *
   * @remarks
   * Abstract method to fetch system configuration information. The actual implementation should be provided by subclasses.
   *
   * @returns Promise with configuration data including client credentials, environment, and stored payment methods settings
   */
  abstract config(): Promise<ConfigResponse>;

  /**
   * Get status
   *
   * @remarks
   * Abstract method to check the status of PayPal gateway. The actual implementation should be provided by subclasses.
   *
   * @returns Promise with status information from PayPal gateway
   */
  abstract status(): Promise<StatusResponse>;

  /**
   * Get supported payment components
   *
   * @remarks
   * Abstract method to fetch the supported payment components by the processor. The actual implementation should be provided by subclasses.
   *
   * @returns Promise with payment components supported in components and express modes. Dropin is not supported in current implementation.
   */
  abstract getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * PAYMENT HANDLERS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Create payments and process transactions
   * @remarks Handlers except createPayment require a valid commercetools payment ID.
   */

  /**
   * Create payment
   *
   * @remarks
   * Creates a commercetools payment for the current cart and returns SDK options plus cart/customer details for the enabler to render the payment button.
   *
   * @param request - payment configuration including payment method type, builder type
   * @returns Promise with PayPal SDK options and payment object with cart/customer details
   */
  abstract createPayment(
    request: PaymentRequestSchemaDTO
  ): Promise<PaymentResponseSchemaDTO>;

  /**
   * Create order
   *
   * @remarks
   * Creates the real PayPal order (`POST /v2/checkout/orders`) for a previously-created commercetools payment and returns its id/status to the enabler.
   *
   * @param request - commercetools payment ID plus optional PayPal order options (funding source, vaulting)
   * @returns Promise with the PayPal order id/status for the enabler's PayPal JS SDK button
   */
  abstract createOrder(
    request: CreateOrderRequestSchemaDTO
  ): Promise<CreateOrderResponseSchemaDTO>;

  /**
   * Authorize order
   *
   * @remarks
   * Authorizes a previously-created, buyer-approved PayPal order (`POST /v2/checkout/orders/{id}/authorize`) and must add a commercetools `Authorization` transaction.
   *
   * @param request - commercetools payment ID plus the approved PayPal order ID
   * @returns Promise with the PayPal order id/status for the enabler
   */
  abstract authorizeOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO>;

  /**
   * Capture order
   *
   * @remarks
   * Captures a previously-created, buyer-approved PayPal order directly (`POST /v2/checkout/orders/{id}/capture`) and must add a commercetools `Charge` transaction.
   *
   * @param request - commercetools payment ID plus the approved PayPal order ID
   * @returns Promise with the PayPal order id/status for the enabler
   */
  abstract captureOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO>;

  /**
   * Authenticate 3DS order
   *
   * @remarks
   * Checks a PayPal order's 3D Secure authentication result (`GET /v2/checkout/orders/{id}`) — a read-only lookup that must never add a commercetools transaction.
   *
   * @param request - commercetools payment ID plus the PayPal order ID to check
   * @returns Promise with the 3DS result, if available
   */
  abstract authenticateThreeDSOrder(
    request: AuthenticateThreeDSOrderRequestSchemaDTO
  ): Promise<AuthenticateThreeDSOrderResponseSchemaDTO>;

  /**
   * Update shipping (address/option change)
   *
   * @remarks
   * Handles a shipping address or option change during the PayPal Express popup flow and must never add a commercetools transaction — a pre-approval cart/PayPal-order mutation only.
   *
   * @param request - payment ID, PayPal order ID, and either an address (for address changes) or shippingMethodId (for option changes)
   * @returns Promise with the updated shipping options and totals
   */
  abstract updateShipping(
    request: UpdateShippingRequestSchemaDTO
  ): Promise<UpdateShippingResponseSchemaDTO>;

  /**
   * Refund payment
   *
   * @remarks
   * Abstract method to refund a captured payment. The actual implementation should be provided by subclasses.
   *
   * @param request - commercetools payment object, optional refund amount, optional transaction ID
   * @returns Promise with success response
   */
  abstract refundPayment(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentUpdateResponseSchemaDTO>;

  /**
   * Settlement (Capture)
   *
   * @remarks
   * Abstract method to capture an authorized transaction. The actual implementation should be provided by subclasses.
   *
   * @param request - commercetools payment and optional transaction ID to capture
   * @returns Promise with success response
   */
  abstract settlement(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentUpdateResponseSchemaDTO>;

  /**
   * Cancel payment (void)
   *
   * @remarks
   * Abstract method to void an authorized transaction. The actual implementation should be provided by subclasses.
   *
   * @param request - commercetools payment
   * @returns Promise with success response
   */
  abstract void(
    request: CancelPaymentRequest
  ): Promise<PaymentUpdateResponseSchemaDTO>;

  /**
   * Modify payment
   *
   * @remarks
   * This method is used to execute Capture/Cancel/Refund payment in external PSPs and update composable commerce.
   * The actual invocation to PSPs should be implemented in subclasses
   *
   * The names for commercetools and PayPal methods are mapped in the following way:
   *
   * | commercetools | PayPal   |
   * |---------------|----------|
   * | capture       | capture  |
   * | refund        | refund   |
   * | cancel        | void     |
   *
   * @param opts - input for payment modification including payment ID, action and payment amount
   * @returns Promise with success response
   */

  public async modifyPayment(
    opts: ModifyPayment
  ): Promise<PaymentUpdateResponseSchemaDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });
    const request = opts.data.actions[0];
    logger.info(
      `Received request to modify payment ${opts.paymentId} with action ${request.action}`
    );
    switch (request.action) {
      case "capturePayment": {
        return await this.settlement({
          payment: ctPayment,
          amount: request.amount,
        });
      }
      case "cancelPayment": {
        return await this.void({ payment: ctPayment });
      }
      case "refundPayment": {
        return await this.refundPayment({
          amount: request.amount,
          payment: ctPayment,
          transactionId: request.transactionId,
        });
      }
      case "reversePayment": {
        // Reverse means void what hasn't been captured yet, or refund what has — mirrors
        // commercetools' reversePayment semantics (docs.commercetools.com/checkout/payment-intents-api).
        const capturedBalance = findCapturedChargeBalance(ctPayment);
        if (capturedBalance) {
          if (capturedBalance.remainingAmount <= 0) {
            throw new ErrorInvalidOperation(
              `Payment ${ctPayment.id} has already been fully refunded`
            );
          }
          return await this.refundPayment({
            payment: ctPayment,
            transactionId: capturedBalance.transaction.id,
            amount: {
              ...capturedBalance.transaction.amount,
              centAmount: capturedBalance.remainingAmount,
            },
          });
        }
        return await this.void({ payment: ctPayment });
      }
      default: {
        throw new ErrorInvalidOperation(`Operation not supported.`);
      }
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * CUSTOMER HANDLERS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Customer payment method management (vault operations)
   * @remarks Handlers require valid commercetools customer ID and version.
   */

  /**
   * Get stored payment methods
   *
   * @remarks
   * Abstract method to retrieve stored payment methods for a customer from PayPal vault.
   *
   * @returns Promise with list of stored payment methods
   */
  abstract getStoredPaymentMethods(): Promise<StoredPaymentMethodsResponse>;

  /**
   * Delete stored payment method
   *
   * @remarks
   * Abstract method to delete a stored payment method from PayPal vault by its token.
   *
   * @param token - the PayPal vault payment token to delete
   */
  abstract deleteStoredPaymentMethod(token: string): Promise<void>;
}
