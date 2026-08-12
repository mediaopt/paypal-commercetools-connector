import {
  statusHandler,
  healthCheckCommercetoolsPermissions,
  ErrorInvalidOperation,
  Cart,
  Payment,
  CommercetoolsPaymentMethodService,
} from "@commercetools/connect-payments-sdk";
import {
  PaymentMethod,
  PaymentUpdateAction,
  TransactionState,
} from "@commercetools/platform-sdk";

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
  CreateOrderRequestSchemaDTO,
  CreateOrderResponseSchemaDTO,
  AuthenticateThreeDSOrderRequestSchemaDTO,
  AuthenticateThreeDSOrderResponseSchemaDTO,
  OnApproveRequestSchemaDTO,
  OnApproveResponseSchemaDTO,
} from "../dtos/paypal-payment.dto";
import {
  StoredPaymentMethodsResponse,
} from "../dtos/stored-payment-methods.dto";
import { getCartIdFromContext } from "../libs/fastify/context/context";
import { getStoredPaymentMethodsConfig } from "../config/stored-payment-methods.config";
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalAuthorizationStatusToCommercetoolsTransactionState,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  mapCommercetoolsMoneyToPayPalMoney,
  createPayPalOrder,
  getPayPalOrder,
  authorizePayPalOrder,
  capturePayPalOrder,
  capturePayPalAuthorization,
  getPaymentTokens,
  deletePaymentToken,
  generateUserIdToken,
  getSettings,
  Order,
  Authorization2StatusEnum,
  Capture2StatusEnum,
  Capture2,
  logger,
} from "common-connect";

import { log } from "../libs/logger";
import { errorMessage, retryCTSync } from "../utils/error.utils";
import {
  buildOrderRequest,
  extractPayPalPurchaseUnitTransaction,
  findAuthorizationTransactionId,
} from "../utils/order.utils";
import {
  isCardPaymentToken,
  mapPayPalPaymentTokenToStoredPaymentMethod,
} from "../utils/storedPaymentMethod.utils";
import { PayPalCustomerService } from "./paypal-customer.service";

export class PayPalPaymentService extends AbstractPaymentService {
  private payPalCustomerService: PayPalCustomerService;
  private ctPaymentMethodService: CommercetoolsPaymentMethodService;

  constructor(opts: PayPalPaymentServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService);
    this.payPalCustomerService = new PayPalCustomerService({
      ctAPI: opts.ctAPI,
    });
    this.ctPaymentMethodService = opts.ctPaymentMethodService;
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
    const [rawSettings, cartSummary] = await Promise.all([
      getSettings(),
      this.ctCartService
        .getCart({ id: getCartIdFromContext() })
        .then((ctCart) => ({
          customerId: ctCart.customerId,
          country: ctCart.country,
          currency: ctCart.totalPrice?.currencyCode,
        }))
        .catch((e) => {
          log.warn(
            `config: failed to fetch cart for sdkOptions/stored-payment-methods derivation — ${errorMessage(
              e
            )}`
          );
          return undefined;
        }),
    ]);
    const settings = rawSettings ?? getConfig().settingsFallback;

    // Only worth resolving when vaulting is actually enabled — otherwise nothing uses the token
    // and it's not worth an extra PayPal OAuth call on every enabler mount.
    const userIdToken = getConfig().enableVaulting
      ? await this.resolveUserIdToken(cartSummary?.customerId)
      : undefined;

    return {
      returnUrl: getConfig().returnUrl,
      environment: getConfig().paypalEnvironment,
      storedPaymentMethodsConfig: {
        isEnabled: this.isStoredPaymentMethodsEnabled(cartSummary),
      },
      enableVaulting: getConfig().enableVaulting,
      perMethodConfig: getConfig().perMethodConfig,
      settings,
      userIdToken,
      sdkOptions: this.buildSdkOptions(cartSummary),
    };
  }

  /**
   * Resolves the CT customer's linked PayPal customer id (custom.fields.PayPalUserId) — the same
   * pointer getStoredPaymentMethods()/deleteStoredPaymentMethod() use. commercetools is only a
   * reference here; PayPal remains the source of truth for everything downstream of this id.
   */
  private async resolvePayPalCustomerId(
    ctCustomerId?: string
  ): Promise<string | undefined> {
    if (!ctCustomerId) {
      return undefined;
    }
    const ctCustomer = await this.payPalCustomerService.getCtCustomer(
      ctCustomerId
    );
    return ctCustomer?.custom?.fields?.PayPalUserId;
  }

  private async resolveUserIdToken(
    ctCustomerId?: string
  ): Promise<string | undefined> {
    const paypalCustomerId = await this.resolvePayPalCustomerId(ctCustomerId);
    if (!paypalCustomerId) {
      return undefined;
    }
    try {
      return await generateUserIdToken(paypalCustomerId);
    } catch (e) {
      log.warn(
        `config: failed to generate PayPal userIdToken for customer ${paypalCustomerId} — ${errorMessage(
          e
        )}`
      );
      return undefined;
    }
  }

  /**
   * Indicates if the feature stored payment methods is enabled/available.
   * It can be enhanced with further checks if so required.
   */
  isStoredPaymentMethodsEnabled(cartSummary?: {
    customerId?: string;
  }): boolean {
    if (!getStoredPaymentMethodsConfig().enabled) {
      return false;
    }

    return cartSummary?.customerId !== undefined;
  }

  /**
   * Overlays cart-derived currency/buyerCountry onto every component's PayPal SDK script
   * options — cart data wins when available, PAYPAL_SDK_OPTIONS/defaults stay as the fallback.
   */
  private buildSdkOptions(cartSummary?: {
    country?: string;
    currency?: string;
  }): ConfigResponse["sdkOptions"] {
    const configured = getConfig().sdkOptions;
    if (!cartSummary) {
      return configured;
    }

    const cartOptions: Record<string, unknown> = {};
    if (cartSummary.currency) {
      cartOptions.currency = cartSummary.currency;
    }
    if (cartSummary.country) {
      cartOptions.buyerCountry = cartSummary.country;
    }
    if (!Object.keys(cartOptions).length) {
      return configured;
    }

    return {
      ...configured,
      PayPal: {
        standard: { ...configured.PayPal?.standard, ...cartOptions },
        express: { ...configured.PayPal?.express, ...cartOptions },
      },
      CardFields: { ...configured.CardFields, ...cartOptions },
    };
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
      !!ctCart.shippingAddress ||
      (ctCart.shipping && ctCart.shipping.length > 0);
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
   * Create order
   *
   * @remarks
   * Calls PayPal's Orders API to create the real PayPal order for a previously-created
   * commercetools payment, then syncs the PayPal order id/status/method onto that payment.
   * Deliberately does not add a commercetools transaction — see abstract-payment.service.ts's
   * createOrder doc for why (commercetools Checkout would create a commercetools Order
   * prematurely, before the buyer has approved on PayPal).
   *
   * @param request - commercetools payment ID plus optional PayPal order options
   * @returns Promise with the PayPal order id/status for the enabler's PayPal JS SDK button
   */
  public async createOrder({
    paymentId,
    orderData,
    payPalIntent,
  }: CreateOrderRequestSchemaDTO): Promise<CreateOrderResponseSchemaDTO> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    // So a returning customer's newly-vaulted payment source gets attached to their existing
    // PayPal customer id instead of a brand-new, disconnected one — see buildOrderRequest. Only
    // worth the extra CT customer lookup when actually vaulting something.
    const existingPayPalCustomerId = orderData?.storeInVault
      ? await this.resolvePayPalCustomerId(ctCart.customerId)
      : undefined;

    const orderRequest = buildOrderRequest(
      payment,
      ctCart,
      orderData,
      payPalIntent,
      existingPayPalCustomerId
    );

    let response: Order;
    try {
      response = await createPayPalOrder(orderRequest);
    } catch (e) {
      log.error(
        `createOrder: PayPal order creation failed for payment ${
          payment.id
        } — ${e instanceof Error ? e.message : JSON.stringify(e)}`
      );
      throw new ErrorInvalidOperation(
        `Failed to create PayPal order for payment ${payment.id}`
      );
    }

    await retryCTSync(
      () => this.syncPayPalOrderStatus(payment.id, response),
      "createOrder",
      payment.id,
      response.status ?? ""
    );

    return {
      orderData: {
        id: response.id ?? "",
        status: response.status ?? "",
        payment_source: response.payment_source,
        links: response.links,
      },
    };
  }

  /**
   * Persists the PayPal customer id a card vault produced (buildOrderRequest's
   * payment_source.card.attributes.vault.store_in_vault) onto the CT customer's PayPalUserId
   * custom field, so getStoredPaymentMethods()/deleteStoredPaymentMethod() can find it later —
   * same pointer they already resolve via resolvePayPalCustomerId. No-ops when the order wasn't a
   * vaulted card payment, the payment has no CT customer, or a PayPalUserId is already set
   * (linkPayPalCustomerId itself handles that last case).
   */
  private async linkVaultedCardCustomer(
    payment: Payment,
    response: Order
  ): Promise<void> {
    const vaultCustomerId =
      response.payment_source?.card?.attributes?.vault?.customer?.id;
    if (!vaultCustomerId || !payment.customer?.id) {
      return;
    }
    await this.payPalCustomerService.linkPayPalCustomerId(
      payment.customer.id,
      vaultCustomerId
    );
  }

  /**
   * Shared by authorizeOrder()/captureOrder() — both call a PayPal API, add the matching CT
   * transaction, sync order status, and link a vaulted card's customer id, differing only in
   * which PayPal call/purchase-unit key/transaction type/status mapper applies.
   */
  private async finalizeOrder(
    { paymentId, orderID }: OnApproveRequestSchemaDTO,
    config: {
      operation: "authorizeOrder" | "captureOrder";
      callPayPal: (orderID: string) => Promise<Order>;
      purchaseUnitKey: "authorizations" | "captures";
      transactionType: "Authorization" | "Charge";
      mapStatus: (status?: string) => TransactionState;
    }
  ): Promise<OnApproveResponseSchemaDTO> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    if (payment.interfaceId && payment.interfaceId !== orderID) {
      throw new ErrorInvalidOperation(
        `Order ${orderID} does not belong to payment ${paymentId}`
      );
    }

    let response: Order;
    try {
      response = await config.callPayPal(orderID);
    } catch (e) {
      log.error(
        `${config.operation}: PayPal call failed for payment ${
          payment.id
        } — ${errorMessage(e)}`
      );
      throw new ErrorInvalidOperation(
        `Failed to ${config.operation === "authorizeOrder" ? "authorize" : "capture"} PayPal order ${orderID}`
      );
    }

    const transaction = extractPayPalPurchaseUnitTransaction(
      response.purchase_units,
      config.purchaseUnitKey
    );

    // updatePayment (Payment resource) and syncPayPalOrderStatus (same Payment resource, via a
    // raw CT call) both retry on a version conflict with a fresh refetch, so running them
    // alongside linkVaultedCardCustomer (Customer resource) here is safe, not just faster.
    await Promise.all([
      this.ctPaymentService.updatePayment({
        id: paymentId,
        transaction: {
          type: config.transactionType,
          amount: payment.amountPlanned,
          interactionId: transaction?.id,
          state: config.mapStatus(transaction?.status),
        },
      }),
      retryCTSync(
        () => this.syncPayPalOrderStatus(paymentId, response),
        config.operation,
        paymentId,
        response.status ?? ""
      ),
      this.linkVaultedCardCustomer(payment, response),
    ]);

    return {
      orderData: { id: response.id ?? "", status: response.status ?? "" },
    };
  }

  /**
   * Authorize order
   *
   * @remarks
   * Calls PayPal's Orders API to authorize a previously-created, buyer-approved PayPal order.
   * Unlike createOrder, this is the buyer-approved moment — adds a commercetools Authorization
   * transaction so commercetools Checkout creates the commercetools Order. The authorization's
   * interactionId is what settlement() later looks up to actually capture it.
   *
   * @param request - commercetools payment ID plus the approved PayPal order ID
   * @returns Promise with the PayPal order id/status for the enabler
   */
  public async authorizeOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO> {
    return this.finalizeOrder(request, {
      operation: "authorizeOrder",
      callPayPal: (orderID) => authorizePayPalOrder(orderID, {}),
      purchaseUnitKey: "authorizations",
      transactionType: "Authorization",
      mapStatus: (status) =>
        mapPayPalAuthorizationStatusToCommercetoolsTransactionState(
          status as Authorization2StatusEnum | undefined
        ),
    });
  }

  /**
   * Capture order
   *
   * @remarks
   * Calls PayPal's Orders API to capture a previously-created, buyer-approved PayPal order
   * directly — the immediate-capture counterpart to authorizeOrder, used when the merchant's
   * configured PayPal intent is Capture. Adds a commercetools Charge transaction, which is what
   * triggers commercetools Checkout to create the commercetools Order for this flow.
   *
   * @param request - commercetools payment ID plus the approved PayPal order ID
   * @returns Promise with the PayPal order id/status for the enabler
   */
  public async captureOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO> {
    return this.finalizeOrder(request, {
      operation: "captureOrder",
      callPayPal: (orderID) => capturePayPalOrder(orderID, {}),
      purchaseUnitKey: "captures",
      transactionType: "Charge",
      mapStatus: (status) =>
        mapPayPalCaptureStatusToCommercetoolsTransactionState(
          status as Capture2StatusEnum | undefined
        ),
    });
  }

  /**
   * Read-only lookup — does not add a transaction or otherwise mutate the commercetools payment,
   * same lifecycle constraint as createOrder (see the class-level doc comment). Only fetches the
   * payment to sanity-check that the caller-supplied orderID actually belongs to it.
   */
  public async authenticateThreeDSOrder({
    paymentId,
    orderID,
  }: AuthenticateThreeDSOrderRequestSchemaDTO): Promise<AuthenticateThreeDSOrderResponseSchemaDTO> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    if (payment.interfaceId && payment.interfaceId !== orderID) {
      throw new ErrorInvalidOperation(
        `Order ${orderID} does not belong to payment ${paymentId}`
      );
    }

    let order: Order;
    try {
      order = await getPayPalOrder(orderID);
    } catch (e) {
      log.error(
        `authenticateThreeDSOrder: PayPal order lookup failed for payment ${
          payment.id
        } — ${errorMessage(e)}`
      );
      throw new ErrorInvalidOperation(
        `Failed to look up PayPal order ${orderID}`
      );
    }

    const authenticationResult =
      order.payment_source?.card?.authentication_result;

    return {
      ...(authenticationResult && {
        approve: {
          liability_shift: authenticationResult.liability_shift,
          three_d_secure: {
            enrollment_status:
              authenticationResult.three_d_secure?.enrollment_status,
            authentication_status:
              authenticationResult.three_d_secure?.authentication_status,
          },
        },
      }),
    };
  }

  /**
   * Applies setInterfaceId / setStatusInterfaceCode / setStatusInterfaceText /
   * setMethodInfoMethod via a raw CT API call — connect-payments-sdk's generic
   * updatePayment() does not expose the status actions. Re-fetches the payment
   * for a fresh version on every call so retryCTSync's retries avoid version
   * conflicts. Used to sync the data with connect format to keep full
   * compatibility with connect modules
   */
  private async syncPayPalOrderStatus(
    paymentId: string,
    response: Order
  ): Promise<void> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });
    const actions: PaymentUpdateAction[] = [
      ...(!payment.interfaceId && response.id
        ? [{ action: "setInterfaceId" as const, interfaceId: response.id }]
        : []),
      ...(response.status
        ? [
            {
              action: "setStatusInterfaceCode" as const,
              interfaceCode: response.status,
            },
            {
              action: "setStatusInterfaceText" as const,
              interfaceText: response.status,
            },
          ]
        : []),
      ...(response.payment_source && !payment.paymentMethodInfo?.method
        ? [
            {
              action: "setMethodInfoMethod" as const,
              method: mapPayPalPaymentSourceToCommercetoolsMethodInfo(
                response.payment_source
              ),
            },
          ]
        : []),
    ];
    if (!actions.length) return;
    await paymentSDK.ctAPI.client
      .payments()
      .withId({ ID: paymentId })
      .post({ body: { version: payment.version, actions } })
      .execute();
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

    const authorizationId = findAuthorizationTransactionId(ctPayment);
    // `amount` (from the commercetools Payment Intents request) has no fractionDigits of its own —
    // borrow it from the payment's own amountPlanned (same currency, same precision).
    const paypalAmount = {
      currency_code: amount.currencyCode,
      value: mapCommercetoolsMoneyToPayPalMoney({
        ...amount,
        type: "centPrecision",
        fractionDigits: ctPayment.amountPlanned.fractionDigits,
      }),
    };

    let response: Capture2;
    try {
      response = await capturePayPalAuthorization(authorizationId, {
        amount: paypalAmount,
      });
    } catch (e) {
      log.error(
        `settlement: PayPal capture failed for payment ${
          ctPayment.id
        } — ${errorMessage(e)}`
      );
      throw new ErrorInvalidOperation(
        `Failed to capture PayPal authorization ${authorizationId}`
      );
    }

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: "Charge",
        amount,
        interactionId: response.id,
        state: mapPayPalCaptureStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    });

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
   * Implementation to retrieve stored payment methods from PayPal vault. commercetools is used
   * only as a pointer (the CT customer's PayPalUserId custom field) — the actual list of stored
   * payment methods is always read live from PayPal, which is the source of truth.
   *
   * @returns Promise with list of stored payment methods
   */
  public async getStoredPaymentMethods(): Promise<StoredPaymentMethodsResponse> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    if (!ctCart.customerId) {
      log.warn(
        "getStoredPaymentMethods: cart has no customerId, returning empty"
      );
      return { storedPaymentMethods: [] };
    }

    const paypalCustomerId = await this.resolvePayPalCustomerId(
      ctCart.customerId
    );
    if (!paypalCustomerId) {
      log.warn(
        `getStoredPaymentMethods: CT customer ${ctCart.customerId} has no PayPalUserId, returning empty`
      );
      return { storedPaymentMethods: [] };
    }

    try {
      const { payment_tokens: paymentTokens = [] } = await getPaymentTokens(
        paypalCustomerId
      );
      // Restrict to card tokens before looking anything up in commercetools — only credit card tokens are supported in checkout now.
      const cardTokens = paymentTokens.filter(isCardPaymentToken);
      if (paymentTokens.length !== cardTokens.length)
        log.warn(
          `token(s) not supported by checkout exist(s) for ${paypalCustomerId}`
        );

      // Fetched once for all of this customer's card tokens (rather than per-token) since
      // getByTokenValue itself just fetches this same customer+paymentInterface list and
      // filters client-side — one query does the work of N.
      const ctPaymentMethods = cardTokens.length
        ? await this.ctPaymentMethodService
            .find({
              customerId: ctCart.customerId,
              paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
            })
            .then((result) => result.results)
            .catch(() => [])
        : [];

      const storedPaymentMethods = cardTokens.map((token) => {
        const createdAt = this.resolveStoredPaymentMethodCreatedAt(
          ctCart.customerId as string,
          token.id,
          ctPaymentMethods
        );
        return mapPayPalPaymentTokenToStoredPaymentMethod(token, createdAt);
      });

      return { storedPaymentMethods };
    } catch (e) {
      log.warn(
        `getStoredPaymentMethods: could not list PayPal payment tokens for customer ${paypalCustomerId} — ${errorMessage(
          e
        )}`
      );
      return { storedPaymentMethods: [] };
    }
  }

  /**
   * PayPal's vault "list customer payment tokens" API doesn't return a creation timestamp per
   * token — expose commercetools' own PaymentMethod record's createdAt when one exists (kept in
   * sync on a best-effort basis, see deleteStoredPaymentMethod), otherwise fall back to the
   * current request time. Matches against an already-fetched list of the customer's CT
   * PaymentMethod records (see getStoredPaymentMethods) rather than querying per token.
   */
  private resolveStoredPaymentMethodCreatedAt(
    customerId: string,
    tokenValue: string,
    ctPaymentMethods: PaymentMethod[]
  ): string {
    const ctPaymentMethod = ctPaymentMethods.find(
      (paymentMethod) => paymentMethod.token?.value === tokenValue
    );
    if (!ctPaymentMethod?.createdAt)
      log.warn(
        `One of the tokens for customer ${customerId} was created outside of checkout connector and therefore has no available creation time, resolving to current date`
      );
    return ctPaymentMethod?.createdAt ?? new Date().toISOString();
  }

  /**
   * Delete stored payment method
   *
   * @remarks
   * Deletes a payment method directly from PayPal's vault by token — commercetools is not
   * consulted to authorize this, since the PayPal token is the sole identifier the enabler has
   * for a stored method. commercetools' cart is only fetched afterward, best-effort, to attempt
   * a mirror cleanup of any commercetools-native PaymentMethod record.
   *
   * @param token - the PayPal vault payment token to delete
   */
  public async deleteStoredPaymentMethod(token: string): Promise<void> {
    const cartId = getCartIdFromContext();
    let ctCart: Cart | undefined;
    try {
      [, ctCart] = await Promise.all([
        deletePaymentToken(token),
        this.ctCartService.getCart({ id: cartId }).catch(() => undefined),
      ]);
      log.info(
        `deleteStoredPaymentMethod: success, cartId: ${
          ctCart?.id ?? cartId ?? "unavailable"
        }`
      );
    } catch (e) {
      log.error(
        `deleteStoredPaymentMethod: failed, cartId: ${
          cartId ?? "unavailable"
        } — ${errorMessage(e)}`
      );
      throw e;
    }

    // Best-effort mirror cleanup of the commercetools-native PaymentMethod record, if one exists.
    // The PayPal deletion above already succeeded and is the authoritative action; this fire-and-
    // forget cleanup just keeps commercetools from holding a stale reference.
    if (ctCart?.customerId) {
      const customerId = ctCart.customerId;
      void this.ctPaymentMethodService
        .getByTokenValue({
          customerId,
          tokenValue: token,
          paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
        })
        .then((ctPaymentMethod) =>
          this.ctPaymentMethodService.delete({
            customerId,
            id: ctPaymentMethod.id,
            version: ctPaymentMethod.version,
          })
        )
        .catch((e) =>
          log.warn(
            `deleteStoredPaymentMethod: no matching commercetools PaymentMethod record: ${errorMessage(e)}`
          )
        );
    }
  }
}
