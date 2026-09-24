import {
  statusHandler,
  healthCheckCommercetoolsPermissions,
  ErrorInvalidOperation,
  Cart,
  Payment,
  CommercetoolsPaymentMethodService,
} from "@commercetools/connect-payments-sdk";
import {
  PaymentUpdateAction,
  TransactionState,
  CartUpdateAction,
} from "@commercetools/platform-sdk";

import {
  CancelPaymentRequest,
  ConfigResponse,
  ModifyPaymentWithTransactionRequest,
  StatusResponse,
} from "./types/operation.type";

import { SupportedPaymentComponentsSchemaDTO } from "../dtos/operations/payment-componets.dto";
import {
  PaymentIntentResponseSchemaDTO,
  PaymentModificationStatus,
} from "../dtos/operations/payment-intents.dto";
import packageJSON from "../../package.json";

import { AbstractPaymentService } from "./abstract-payment.service";
import { getConfig } from "../config/config";
import { appLogger, paymentSDK } from "../payment-sdk";
import { PayPalPaymentServiceOptions } from "./types/paypal-payment.type";
import {
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
  CreateOrderRequestSchemaDTO,
  CreateOrderResponseSchemaDTO,
  AuthenticateThreeDSOrderRequestSchemaDTO,
  AuthenticateThreeDSOrderResponseSchemaDTO,
  OnApproveRequestSchemaDTO,
  OnApproveResponseSchemaDTO,
  ExpressApproveRequestSchemaDTO,
  ExpressApproveResponseSchemaDTO,
  UpdateShippingRequestSchemaDTO,
  UpdateShippingResponseSchemaDTO,
  StandardPaymentMethodType,
  CustomBuilderType,
} from "../dtos/paypal-payment.dto";
import { toPaymentMethodIconKey } from "../utils/paymentMethodIcon.utils";
import { StoredPaymentMethodsResponse } from "../dtos/stored-payment-methods.dto";
import {
  getCartIdFromContext,
  getCheckoutTransactionItemIdFromContext,
  getMerchantReturnUrlFromContext,
} from "../libs/fastify/context/context";
import { getStoredPaymentMethodsConfig } from "../config/stored-payment-methods.config";
import {
  mapValidCommercetoolsLineItemsToPayPalItems,
  mapCommercetoolsCartToPayPalPriceBreakdown,
  resolveCommercetoolsCartShippingAddress,
  mapCommercetoolsAddressToPayPalAddress,
  mapPayPalPaymentSourceToCommercetoolsMethodInfo,
  mapPayPalCaptureStatusToCommercetoolsTransactionState,
  createPayPalOrder,
  getPayPalOrder,
  authorizePayPalOrder,
  capturePayPalOrder,
  capturePayPalAuthorization,
  getPaymentTokens,
  deletePaymentToken,
  generateUserIdToken,
  getSettings,
  updatePayPalOrder,
  Order,
  Capture2,
  CheckoutPaymentIntent,
  findMostRecentTransaction,
  Patch,
  PayPalSettings,
  TIMEOUT_PAYMENT,
  RETRY_DELAY,
  refundPayPalOrder,
  mapPayPalRefundStatusToCommercetoolsTransactionState,
  voidPayPalAuthorization,
  mapPayPalVoidStatusToCommercetoolsTransactionState,
  RefundRequest,
  Refund,
  Authorization2,
} from "common-connect";

import { log } from "../libs/logger";
import {
  errorMessage,
  errorResponseBody,
  isPayPalInvalidPatchOperationError,
  payPalDebugIdSuffix,
  retryCTSync,
} from "../utils/error.utils";
import {
  buildOrderRequest,
  buildPayPalAmount,
  extractPayPalPurchaseUnitTransaction,
  findAuthorizationTransactionId,
  resolvePayPalIntentTransactionConfig,
  findRefundableTransactionId,
  findVoidableTransaction,
  buildPlaceholderInteractionId,
  isPlaceholderInteractionId,
} from "../utils/order.utils";
import {
  fetchPayPalShippingOptionsForCart,
  PayPalShippingOption,
} from "../utils/shipping.utils";
import {
  isCardPaymentToken,
  mapPayPalPaymentTokenToStoredPaymentMethod,
  resolveStoredPaymentMethodCreatedAt,
} from "../utils/storedPaymentMethod.utils";
import {
  isStoredPaymentMethodsEnabled,
  buildStandardScriptCartOverlay,
  buildExpressSdkOptions,
} from "../utils/config.utils";
import {
  buildProcessorLogging,
  buildProcessorCustomerLogging,
  ProcessorApiCallName,
  ProcessorCustomerApiCallName,
} from "../utils/processorInteraction.utils";
import { PayPalCustomerService } from "./paypal-customer.service";

const buildSetShippingMethodAction = (
  shippingMethodId: string
): CartUpdateAction => ({
  action: "setShippingMethod" as const,
  shippingMethod: { typeId: "shipping-method" as const, id: shippingMethodId },
});

// Failure-path response payload for logProcessorInteraction()/logProcessorCustomerInteraction()
// — matches the shape paypal-commercetools-extension's handleError() (response.utils.ts)
const buildErrorResponsePayload = (e: unknown) => ({
  success: false,
  message: `${errorMessage(e)}${payPalDebugIdSuffix(e)}`,
  details: errorResponseBody(e),
});

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

  // Merges the CT custom object (mc app's saved settings, when available) over processor's own
  // config-tier base (env-configured PAYPAL_SETTINGS layered over common-connect's
  // CUSTOM_OBJECT_DEFAULT_VALUES — see getConfig().settingsFallback) field-by-field, rather than
  // wholesale-replacing it — so a custom object missing a field (e.g. not yet resaved after a new
  // field was added) still falls back to processor's base instead of leaving it undefined.
  private async resolveSettings(): Promise<Partial<PayPalSettings>> {
    const rawSettings = await getSettings();
    if (!rawSettings)
      log.warn(`No settings configured in merchant center application.`);
    return rawSettings
      ? { ...getConfig().settingsFallback, ...rawSettings }
      : getConfig().settingsFallback;
  }

  public async config(): Promise<ConfigResponse> {
    const [settings, cartSummary] = await Promise.all([
      this.resolveSettings(),
      this.ctCartService
        .getCart({ id: getCartIdFromContext() })
        .then((ctCart) => ({
          customerId: ctCart.customerId,
          country: ctCart.country,
          currency: ctCart.totalPrice?.currencyCode,
        }))
        .catch((e) => {
          log.warn(
            `config: failed to fetch cart for script-options/stored-payment-methods derivation — ${errorMessage(
              e
            )}`
          );
          return undefined;
        }),
    ]);

    // Only worth resolving when vaulting is actually enabled — otherwise nothing uses the token
    // and it's not worth an extra PayPal OAuth call on every enabler mount.
    const userIdToken = getConfig().enableVaulting
      ? await this.resolveUserIdToken(cartSummary?.customerId)
      : undefined;

    // Per-component overrides (style/fundingSource/messagesStyle/...), sourced from PAYPAL_BUTTON_CONFIG
    // — already componentType-keyed (plus the dedicated PayPalExpress slot), passed through as-is;
    // the enabler merges these over its own defaults and the general settings above (see
    // enabler's RenderTemplate/resolveOptions.ts 4-layer resolution).
    const mergedSettings = {
      ...settings,
      ...getConfig().buttonConfig,
    };

    // Shared script options for every *standard* and stored component (PayPal Express is configured independently).
    // `components` is narrowed here by settings.acceptCredit — the only accept* flag with a real
    // components-level effect (card-fields); acceptPayPal/acceptPayLater/acceptLocal are
    // funding-source/method-availability concerns handled elsewhere (Checkout's own predicate,
    // getSupportedPaymentComponents()), not reasons to drop a script component every button-based
    // method still needs. No settings flag exists for "applepay", so its inclusion is controlled by
    // this env var alone.
    const standardScriptOptions = {
      ...getConfig().standardScriptOptions,
      ...buildStandardScriptCartOverlay(cartSummary),
      components: getConfig().standardScriptOptions.components.filter(
        (component) =>
          component !== "card-fields" || settings.acceptCredit !== false
      ),
      // venmo fails isEligible unless it is explicitely added in enableFunding. If it is eligibility is checked correct
      ...(settings.acceptVenmo !== false && {
        enableFunding: Array.from(
          new Set([
            ...(getConfig().standardScriptOptions.enableFunding ?? []),
            "venmo",
          ])
        ),
      }),
    };

    // PAYPAL_STANDARD_SCRIPT_OPTIONS.enableFunding is optional — an unset/empty value means "no
    // connector-invented restriction beyond disableFunding," not "nothing is allowed." Only when
    // the merchant explicitly sets it do we need to guard against a self-contradictory script
    // (the same source force-enabled and force-disabled at once) — fail fast here rather than
    // silently sending PayPal a contradictory request. TODO: consider moving this to
    // connectors/post-deploy.ts as a one-time env-var validation instead of per-request.
    const conflictingFundingSources = (
      standardScriptOptions.enableFunding ?? []
    ).filter((source) =>
      standardScriptOptions.disableFunding?.includes(source)
    );
    if (conflictingFundingSources.length > 0) {
      throw new ErrorInvalidOperation(
        `PAYPAL_STANDARD_SCRIPT_OPTIONS: enableFunding and disableFunding both list ${conflictingFundingSources.join(
          ", "
        )} — remove the contradiction from one of them.`
      );
    }

    // Not a hard requirement (Apple Pay works fine with the generic default), but a merchant who
    // never customized this will show real shoppers a literal "My Store" in Apple's native payment
    // sheet — worth a loud, dev-facing signal to catch during setup. Checked here (once configs
    // from the processor and getSettings are merged, and only when Apple Pay is actually enabled)
    // rather than in the enabler, so this stays the one place to update if Apple Pay ever becomes
    // configurable via the mc app instead of PAYPAL_BUTTON_CONFIG.
    if (
      standardScriptOptions.components.includes("applepay") &&
      !mergedSettings.ApplePay?.applePayDisplayName
    ) {
      log.warn(
        'ApplePay is using the default applePayDisplayName ("My Store") — set PAYPAL_BUTTON_CONFIG.ApplePay.applePayDisplayName to your store\'s real name.'
      );
    }

    return {
      clientId: getConfig().paypalClientId ?? "",
      returnUrl: getConfig().returnUrl,
      environment: getConfig().paypalEnvironment,
      storedPaymentMethodsConfig: {
        isEnabled: isStoredPaymentMethodsEnabled(cartSummary),
      },
      enableVaulting: getConfig().enableVaulting,
      // True whenever PayPal Express has an actual review step configured after buyer approval.
      // Drives: usePayment.tsx's handleOnApprove (call expressApprove instead of
      // authorize/capture) and buildScriptOptions()'s matching `commit: false` for the "Continue
      // to Review Order" button text — see createOrder experience_context.user_action.
      redirectOnApprove: this.hasExpressReviewStep(),
      settings: mergedSettings,
      userIdToken,
      expressSdkOptions: buildExpressSdkOptions(cartSummary),
      standardScriptOptions,
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
      const userIdToken = await generateUserIdToken(paypalCustomerId);
      void this.logProcessorCustomerInteraction(
        ctCustomerId as string,
        "getUserIDToken",
        { customerId: paypalCustomerId },
        userIdToken
      );
      return userIdToken;
    } catch (e) {
      log.warn(
        `config: failed to generate PayPal userIdToken for customer ${paypalCustomerId} — ${errorMessage(
          e
        )}${payPalDebugIdSuffix(e)}`
      );
      void this.logProcessorCustomerInteraction(
        ctCustomerId as string,
        "getUserIDToken",
        { customerId: paypalCustomerId },
        buildErrorResponsePayload(e)
      );
      return undefined;
    }
  }

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

  public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    return {
      dropins: [],
      components: Object.values(StandardPaymentMethodType).map((type) => ({
        type: toPaymentMethodIconKey(type),
      })),
      express: [
        { type: toPaymentMethodIconKey(StandardPaymentMethodType.PAYPAL) },
      ],
    };
  }

  // Request is empty - all data retrieved from cart in session
  public async createPayment(
    _request: PaymentRequestSchemaDTO
  ): Promise<PaymentResponseSchemaDTO> {
    // Expanded so a still-relevant last-linked payment (i.e. if payment method change was triggered) can be reused
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
      expand: ["paymentInfo.payments[*]"],
    });

    const amountPlanned = await this.ctCartService.getPaymentAmount({
      cart: ctCart,
    });

    // try to reuse last payment if it is still relevant
    const lastPayment = ctCart.paymentInfo?.payments?.at(-1)?.obj;
    if (
      lastPayment &&
      this.isRelevantExistingPayment(lastPayment, ctCart, amountPlanned)
    ) {
      log.info(
        `relevant existing payment found for ${ctCart.id}, returing this instead of new`
      );
      return this.buildPaymentResponse(ctCart, lastPayment);
    }
    log.info(
      `no relevant checkout payments found for ${ctCart.id}, creating new payment`
    );

    // Create a new payment in commercetools
    const newPayment = await this.ctPaymentService.createPayment({
      amountPlanned,
      paymentMethodInfo: { paymentInterface: getConfig().paymentInterface },
      checkoutTransactionItemId: getCheckoutTransactionItemIdFromContext(),
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

    // Assigns the custom type making checkout and connect apps working in sync
    // Assigned  once here, with no fields yet (setCustomType replaces the whole custom-fields set,
    // Best-effort: a failure here shouldn't block payment creation.
    // Unlike extension this is not required for checkout functioning in best case scenario
    // But it provides traceable logs for any miscommunication between ct and PayPal APIs
    //
    // Runs alongside "add payment to cart" below — independent CT resources (Payment vs. Cart).
    const assignCustomTypePromise = this.ctPaymentService
      .updatePayment({
        id: newPayment.id,
        customFields: {
          type: { typeId: "type", key: getConfig().paymentTypeKey },
          fields: {},
        },
      })
      .catch((e) => {
        log.warn(
          `createPayment: failed to assign ${
            getConfig().paymentTypeKey
          } custom type to payment ${newPayment.id} — ${errorMessage(e)}`
        );
      });

    const addPaymentPromise = this.ctCartService.addPayment({
      resource: { id: ctCart.id, version: ctCart.version },
      paymentId: newPayment.id,
    });

    await Promise.all([assignCustomTypePromise, addPaymentPromise]);

    return this.buildPaymentResponse(ctCart, newPayment);
  }

  /**
   * Whether `payment` — the cart's last linked payment — can be returned
   * only checkout-relevant payments are considered additionally to standard possible differences
   * */
  private isRelevantExistingPayment(
    payment: Payment,
    ctCart: Cart,
    amountPlanned: { centAmount: number; currencyCode: string }
  ): boolean {
    if (payment.paymentStatus?.interfaceCode !== "Initial") {
      return false;
    }

    if (ctCart.customerId) {
      if (payment.customer?.id !== ctCart.customerId) {
        return false;
      }
    } else if (payment.anonymousId !== ctCart.anonymousId) {
      return false;
    }

    if (
      !payment.checkoutTransactionItemId ||
      payment.checkoutTransactionItemId !==
        getCheckoutTransactionItemIdFromContext()
    ) {
      return false;
    }

    if (
      payment.amountPlanned.centAmount !== amountPlanned.centAmount ||
      payment.amountPlanned.currencyCode !== amountPlanned.currencyCode
    ) {
      return false;
    }

    return (
      payment.paymentMethodInfo?.paymentInterface ===
      getConfig().paymentInterface
    );
  }

  private buildPaymentResponse(
    ctCart: Cart,
    payment: Payment
  ): PaymentResponseSchemaDTO {
    // Gather additional cart data for the response
    const isShipped =
      !!ctCart.shippingAddress ||
      (ctCart.shipping && ctCart.shipping.length > 0);
    const lineItems = mapValidCommercetoolsLineItemsToPayPalItems(
      true, // matchingAmounts: true because amountPlanned was just computed from this cart
      isShipped,
      ctCart.taxCalculationMode,
      false, // isPayUponInvoice: false — this response is payment-method-agnostic, actual PUI order items are built in buildOrderRequest
      ctCart.lineItems,
      ctCart.locale
    );

    const priceBreakdown = mapCommercetoolsCartToPayPalPriceBreakdown(ctCart);

    const { address: resolvedShippingAddress } =
      resolveCommercetoolsCartShippingAddress(ctCart, payment.id);
    const shippingAddress = resolvedShippingAddress
      ? mapCommercetoolsAddressToPayPalAddress(resolvedShippingAddress)
      : undefined;

    // Build response with PayPal SDK options and additional cart data
    return {
      paypalData: {
        clientId: getConfig().paypalClientId ?? "",
        currency: payment.amountPlanned.currencyCode,
      },
      id: payment.id,
      amountPlanned: payment.amountPlanned,
      email: ctCart.customerEmail,
      ctCustomerId: ctCart.customerId,
      firstName: ctCart.billingAddress?.firstName,
      lastName: ctCart.billingAddress?.lastName,
      countryCode: ctCart.billingAddress?.country || ctCart.country,
      shippingAddress,
      // for Express shipping options will be fetched on opening window when PayPal sets address
      lineItems: lineItems ?? undefined,
      priceBreakdown,
    };
  }

  public async createOrder({
    paymentId,
    orderData,
    payPalIntent,
    builderType,
    paymentMethodType,
  }: CreateOrderRequestSchemaDTO): Promise<CreateOrderResponseSchemaDTO> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    // interfaceId is set only once a real authorize/capture already succeeded, and is immutable
    // from then on — so a payment that already has one should not create a new order
    // This error shouldn't be reachable: if cart was changed out of selecting shipping address/method in express -
    // opening the checkout must create a new payment. Added as precaution only
    if (payment.interfaceId) {
      throw new ErrorInvalidOperation(
        `Payment ${paymentId} is already linked to PayPal order ${payment.interfaceId} — refusing to create a new order for it`
      );
    }

    if (paymentMethodType === StandardPaymentMethodType.VENMO) {
      this.validateVenmoOrderParams(payment);
    }

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    if (paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE) {
      this.validatePayUponInvoiceOrderParams(payment, ctCart);
    }

    // Informational only — customerEmail is never actually sent to PayPal (createOrder/
    // buildOrderRequest never reference it), so a missing one here isn't fatal. A real standard
    // checkout flow already forces the buyer to fill this in before the enabler even loads;
    // the one case this can still legitimately fire is a merchant embedding only the standard payment
    // buttons in their own custom checkout UI without collecting it first. PayPal collects the
    // buyer's email inside its own popup for Express, so that case is excluded here — by this
    // point paymentMethodType/builderType are the request's own real values, not a guess.
    const isExpress =
      paymentMethodType === StandardPaymentMethodType.PAYPAL &&
      builderType === CustomBuilderType.EXPRESS;
    if (!isExpress && !ctCart.customerEmail) {
      log.warn(
        `createOrder: cart ${ctCart.id} has no customerEmail for a non-Express order (payment ${paymentId})`
      );
    }

    // So a returning customer's newly-vaulted payment source gets attached to their existing
    // PayPal customer id instead of a brand-new, disconnected one — see buildOrderRequest. Only
    // worth the extra CT customer lookup when actually vaulting something.
    const existingPayPalCustomerId = orderData?.storeInVault
      ? await this.resolvePayPalCustomerId(ctCart.customerId)
      : undefined;

    const returnUrl = this.buildRedirectMerchantUrl(payment.id);
    const cancelUrl = this.resolveMerchantReturnBaseUrl();

    // experience_context.user_action/the matching client-side `commit`
    const showContinueReview =
      builderType === CustomBuilderType.EXPRESS && this.hasExpressReviewStep();

    const orderRequest = buildOrderRequest(
      payment,
      ctCart,
      orderData,
      payPalIntent,
      existingPayPalCustomerId,
      builderType === CustomBuilderType.EXPRESS,
      showContinueReview,
      returnUrl,
      cancelUrl,
      getConfig().orderExperienceContext,
      paymentMethodType
    );

    let response: Order;
    try {
      // orderData?.fraudNetSessionId, when present, must reach PayPal as the
      // PayPal-Client-Metadata-Id header (not a body field) — PayPal validates FraudNet's device
      // data against that header specifically for payment_source.pay_upon_invoice orders and
      // 400s with a dedicated error otherwise.
      response = await createPayPalOrder(
        orderRequest,
        orderData?.fraudNetSessionId
      );
    } catch (e) {
      void this.logProcessorInteraction(
        payment.id,
        "createPayPalOrder",
        orderRequest,
        undefined,
        e
      );
      throw new ErrorInvalidOperation(
        `Failed to create PayPal order for payment ${payment.id}`
      );
    }

    // vaulted payment methods are captured/authorized immediately on create order
    if (response.status === "COMPLETED") {
      const transactionConfig =
        resolvePayPalIntentTransactionConfig(payPalIntent);
      await this.writeSettledOrderTransaction(payment, response, {
        operation: "createOrder",
        ...transactionConfig,
      });
      void this.logProcessorInteraction(
        payment.id,
        "createPayPalOrder",
        orderRequest,
        response,
        undefined,
        response.id
      );

      // The Failure transaction is already recorded above, but the buyer must not be sent to the
      // success page — handleCreateOrder has no non-error channel for a failed outcome
      const failedStatus = this.findFailedSettlementStatus(
        response,
        transactionConfig
      );
      if (failedStatus) {
        throw new ErrorInvalidOperation(
          `PayPal order ${response.id} for payment ${payment.id} completed with a ${failedStatus} ${transactionConfig.transactionType}`
        );
      }

      return {
        orderData: {
          id: response.id ?? "",
          status: response.status ?? "",
          payment_source: response.payment_source,
          links: response.links,
        },
        // Same convention as finalizeOrder: this order already settled synchronously (e.g. a
        // vaulted card), so the buyer needs the same redirect a post-approval finalize gets —
        // handleCreateOrder has no other way to reach the result page for this case.
        merchantReturnUrl: this.buildRedirectMerchantUrl(
          payment.id,
          response.status
        ),
      };
    } else if (
      paymentMethodType === StandardPaymentMethodType.PAY_UPON_INVOICE
    ) {
      const { transactionType } =
        resolvePayPalIntentTransactionConfig(payPalIntent);
      await this.addApprovalPlaceholderTransaction(
        payment,
        response.id ?? "",
        transactionType
      );
      void this.logProcessorInteraction(
        payment.id,
        "createPayPalOrder",
        orderRequest,
        response,
        undefined,
        response.id
      );

      return {
        orderData: {
          id: response.id ?? "",
          status: response.status ?? "",
          payment_source: response.payment_source,
          links: response.links,
        },
        // Standard redirect chain — deliberately NOT getConfig().onApprovePrefix, which is
        // PayPal Express's own legal-review-page override and doesn't apply to PUI.
        merchantReturnUrl: this.buildRedirectMerchantUrl(
          payment.id,
          response.status
        ),
      };
    }

    // No commercetools transaction is added here — only status/interfaceId are synced.
    // commercetools Checkout creates the commercetools Order as soon as it sees any
    // in-progress transaction, so adding one now would create it before the buyer has
    // actually approved on PayPal. That happens later, in authorizeOrder()/captureOrder() — or,
    // when PayPal settles synchronously with no buyer-approval step, in the COMPLETED branch above.
    await retryCTSync(
      () => this.syncPayPalOrderStatus(payment.id, response, false),
      "createOrder",
      payment.id,
      response.status ?? ""
    );
    void this.logProcessorInteraction(
      payment.id,
      "createPayPalOrder",
      orderRequest,
      response,
      undefined,
      response.id
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

  // PayPal's Venmo funding source only supports USD-denominated orders.
  private validateVenmoOrderParams(payment: Payment): void {
    if (payment.amountPlanned.currencyCode !== "USD") {
      throw new ErrorInvalidOperation(
        `Venmo requires a USD-denominated payment; payment ${payment.id} is ${payment.amountPlanned.currencyCode}`
      );
    }
  }

  // PayUponInvoice requires the order amount to exactly match the cart's taxed gross total.
  private validatePayUponInvoiceOrderParams(
    payment: Payment,
    ctCart: Cart
  ): void {
    const cartTotal = (ctCart.taxedPrice?.totalGross ?? ctCart.totalPrice)
      ?.centAmount;
    if (payment.amountPlanned.centAmount !== cartTotal) {
      throw new ErrorInvalidOperation(
        `PayUponInvoice requires order amount to match cart total; payment amount ${payment.amountPlanned.centAmount} does not match cart total ${cartTotal}`
      );
    }
  }

  /**
   * Logs a processor-owned PayPal request/response pair (see utils/processorInteraction.utils.ts)
   * as both an interface interaction and a payment custom field — on success AND on failure
   * (pass the raw `error` to log a failure; its presence, not `response`, decides which), same as
   * its customer counterpart below, so every PAYPAL_PROCESSOR_PAYMENT_API_CALL_NAMES call leaves a
   * commercetools-visible trace regardless of outcome. Also owns the app-level log line itself —
   * one unified log.error/log.info call, instead of each caller writing its own — and builds the
   * `orderId`/`operation` context fragment itself so every call site's message stays consistently
   * shaped.
   * Best-effort: a logging failure is warned, never thrown, so it can't mask or block the actual
   * authorize/capture/create-order outcome. Assumes the payment already carries the
   * paymentTypeKey custom type (see createPayment()).
   * Since this write can block on the same Payment resource the caller just wrote to, call it
   * after (never alongside, e.g. in a Promise.all with) the real write. Don't await it, unless another
   * write to the same Payment follows (e.g. ensureOrderApproved before authorize/capture) — then
   * awaiting keeps the two writes sequential.
   */
  private async logProcessorInteraction(
    paymentId: string,
    apiCallName: ProcessorApiCallName,
    request: unknown,
    response: unknown,
    error?: unknown,
    orderId?: string,
    operation?: string
  ): Promise<void> {
    const orderContext = orderId
      ? `, orderId: ${orderId}${operation ? `, triggered by ${operation}` : ""}`
      : "";
    if (error !== undefined) {
      log.error(
        `${apiCallName} failed for payment ${paymentId}${orderContext} PayPal debug id${payPalDebugIdSuffix(
          error
        )}`
      );
      response = buildErrorResponsePayload(error);
    } else {
      log.info(
        `${apiCallName} succeeded for payment ${paymentId}${orderContext}`
      );
    }

    try {
      const { pspInteractions, customFieldValues } = buildProcessorLogging(
        apiCallName,
        request,
        response
      );
      await this.ctPaymentService.updatePayment({
        id: paymentId,
        pspInteractions,
        customFieldValues,
      });
    } catch (e) {
      log.warn(
        `${apiCallName}: failed to log processor interaction for payment ${paymentId} — ${errorMessage(
          e
        )}`
      );
    }
  }

  /**
   * Customer-level sibling of logProcessorInteraction() — logs a processor-owned PayPal
   * request/response pair (see utils/processorInteraction.utils.ts) onto the CT customer, both
   * on success and on failure.
   * Reuses PayPalCustomerService's getCtCustomer/updateCtCustomer, which already catch and
   * log their own failures — no extra try/catch needed here.
   *
   * Always called fire-and-forget (`void ...`), never awaited - this is log purpose only, not required for actual payment
   */
  private async logProcessorCustomerInteraction(
    ctCustomerId: string,
    apiCallName: ProcessorCustomerApiCallName,
    request: unknown,
    response: unknown
  ): Promise<void> {
    const ctCustomer = await this.payPalCustomerService.getCtCustomer(
      ctCustomerId
    );
    if (!ctCustomer) return;
    await this.payPalCustomerService.updateCtCustomer(
      ctCustomer.id,
      ctCustomer.version,
      buildProcessorCustomerLogging(apiCallName, request, response)
    );
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
    const vault = response.payment_source?.card?.attributes?.vault;
    const vaultCustomerId = vault?.customer?.id;
    if (!vaultCustomerId || !payment.customer?.id) {
      return;
    }
    const customerId = payment.customer.id;

    // Two independent, best-effort writes to two different CT resources (Customer vs.
    // PaymentMethod) — no data dependency between them, so they run in parallel rather than one
    // gating the other, and neither is awaited here: — to prevent slow down users experience.
    //The more important link customer thou has 3 retries, the less important token can be fetched from PayPal.
    void Promise.all([
      this.payPalCustomerService.linkPayPalCustomerId(
        customerId,
        vaultCustomerId
      ),
      vault?.id
        ? this.ctPaymentMethodService
            .save({
              customerId,
              token: vault.id,
              method: StandardPaymentMethodType.CREDIT_CARD,
              paymentInterface:
                getStoredPaymentMethodsConfig().config.paymentInterface,
            })
            .catch((e) =>
              log.warn(
                `linkVaultedCardCustomer: could not save commercetools PaymentMethod record for customer ${customerId} — ${errorMessage(
                  e
                )}`
              )
            )
        : Promise.resolve(),
    ]);
  }

  /**
   * Guards against linking a second PayPal order to a payment that already has one linked
   * (interfaceId, set once at the moment an order is actually approved — see
   * syncPayPalOrderStatus/expressApprove). Deliberately separate from the PayPalOrderId-based
   * ownership checks (finalizeOrder/expressApprove/authenticateThreeDSOrder): PayPalOrderId always
   * reflects whichever order was *created* most recently, so it can't by itself catch the case
   * where an *earlier* order already completed a real authorize/capture for this same payment.
   * If there is a good reason for making exception extension can be used, but that is out of checkout flow scope.
   */
  private assertNotLinkedToDifferentOrder(
    payment: Payment,
    orderID: string
  ): void {
    if (payment.interfaceId && payment.interfaceId !== orderID) {
      throw new ErrorInvalidOperation(
        `Payment ${payment.id} is already linked to a different PayPal order (${payment.interfaceId}); refusing to also link ${orderID}`
      );
    }
  }

  /**
   * Guards finalizeOrder/expressApprove/authenticateThreeDSOrder against acting on a stale PayPal
   * order for this payment. PayPalOrderId is overwritten on every createOrder() call (e.g. the
   * buyer reopens the popup after an earlier attempt — see syncPayPalOrderStatus's own comment), so
   * a caller-supplied orderID that no longer matches it never means the order didn't belong to this
   * payment — it did, at the time it was created — it means a newer order has since superseded it
   * as the one actually meant to be finalized/authenticated.
   */
  private assertIsCurrentPayPalOrder(payment: Payment, orderID: string): void {
    const paypalOrderId = payment.custom?.fields?.PayPalOrderId;
    if (paypalOrderId && paypalOrderId !== orderID) {
      throw new ErrorInvalidOperation(
        `Order ${orderID} is stale for payment ${payment.id} — a newer PayPal order (${paypalOrderId}) has since been created for it`
      );
    }
  }

  /**
   * Confirms a PayPal order has actually been approved before it's authorized/captured, instead
   * of optimistically calling PayPal and only checking on failure. CREATED/PAYER_ACTION_REQUIRED
   * are treated as "buyer may have approved but PayPal hasn't synced it back yet" and polled for
   * up to TIMEOUT_PAYMENT; any other non-approved status is treated as unambiguously wrong and
   * fails immediately.
   */
  private async ensureOrderApproved(
    orderID: string,
    paymentId: string,
    operation: string
  ): Promise<Order> {
    const deadline = Date.now() + TIMEOUT_PAYMENT;

    for (;;) {
      let order: Order;
      try {
        order = await getPayPalOrder(orderID);
      } catch (e) {
        void this.logProcessorInteraction(
          paymentId,
          "getPayPalOrder",
          { orderID },
          undefined,
          e,
          orderID,
          operation
        );
        throw new ErrorInvalidOperation(
          `Failed to look up PayPal order ${orderID}`
        );
      }
      await this.logProcessorInteraction(
        paymentId,
        "getPayPalOrder",
        { orderID },
        order,
        undefined,
        orderID,
        operation
      );

      if (order.status === "APPROVED" || order.status === "COMPLETED") {
        return order;
      }

      if (
        order.status !== "CREATED" &&
        order.status !== "PAYER_ACTION_REQUIRED"
      ) {
        log.error(
          `${operation}: PayPal order ${orderID} is in an unexpected state (status: ${order.status}) for payment ${paymentId}`
        );
        throw new ErrorInvalidOperation(
          `PayPal order ${orderID} is in an unexpected state (status: ${order.status})`,
          { fields: { orderID, orderStatus: order.status } }
        );
      }

      if (Date.now() >= deadline) {
        log.error(
          `${operation}: PayPal order ${orderID} still not approved after ${TIMEOUT_PAYMENT}ms (status: ${order.status}) for payment ${paymentId}`
        );
        throw new ErrorInvalidOperation(
          `PayPal order ${orderID} is not yet approved (status: ${order.status}) — buyer approval may not have finished processing on PayPal's side yet`,
          { fields: { orderID, orderStatus: order.status } }
        );
      }

      log.info(
        `${operation}: PayPal order ${orderID} not yet approved (status: ${order.status}) for payment ${paymentId} — retrying in ${RETRY_DELAY}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  /**
   * Shared by authorizeOrder()/captureOrder()/settlement() — calls a PayPal API, adds the
   * matching CT transaction, syncs order status, and links a vaulted card's customer id,
   * differing only in which PayPal call/purchase-unit key/transaction type/status mapper applies.
   */
  private async applyPayPalOrderTransaction(
    payment: Payment,
    orderID: string,
    config: {
      operation: "authorizeOrder" | "captureOrder";
      callPayPal: (orderID: string) => Promise<Order>;
      purchaseUnitKey: "authorizations" | "captures";
      transactionType: "Authorization" | "Charge";
      mapStatus: (status?: string) => TransactionState;
    }
  ): Promise<Order> {
    const apiCallName: ProcessorApiCallName =
      config.operation === "authorizeOrder"
        ? "authorizePayPalOrder"
        : "capturePayPalOrder";

    // A payment already linked (via interfaceId) to a different order already had a real
    // authorize/capture succeed once — refusing here prevents a second, superseded-but-still-valid
    // order from also being authorized/captured against the same payment (a genuine double-charge
    // risk, not just a data-integrity nicety). Checked before ever calling PayPal.
    this.assertNotLinkedToDifferentOrder(payment, orderID);

    await this.ensureOrderApproved(orderID, payment.id, config.operation);

    let response: Order;
    try {
      response = await config.callPayPal(orderID);
    } catch (e) {
      void this.logProcessorInteraction(
        payment.id,
        apiCallName,
        { orderID },
        undefined,
        e,
        orderID,
        config.operation
      );
      throw new ErrorInvalidOperation(
        `Failed to ${
          config.operation === "authorizeOrder" ? "authorize" : "capture"
        } PayPal order ${orderID}`
      );
    }

    await this.writeSettledOrderTransaction(payment, response, config);
    void this.logProcessorInteraction(
      payment.id,
      apiCallName,
      { orderID },
      response,
      undefined,
      orderID,
      config.operation
    );

    return response;
  }

  /**
   * Writes the CT Authorization/Charge transaction, syncs order status (linking interfaceId),
   * and best-effort links a vaulted card's customer id — from an Order response.
   * Deliberately excludes logProcessorInteraction: callers log their own
   * request/response pair, since "the request" differs per caller.
   *
   * When a placeholder transaction already exists (added by addApprovalPlaceholderTransaction()
   * for the Express-redirect/PUI flows — Pending state, a PayPalOrderId-prefixed marker
   * interactionId, see isPlaceholderInteractionId in order.utils.ts), it's overwritten in place via
   * a raw CT call instead of going through ctPaymentService.updatePayment(): that wrapped helper's
   * own transaction-matching only ever reuses an existing *Initial*-state transaction, so it would
   * add a second, duplicate transaction here rather than recognizing this one. A raw call also has
   * no "won't overwrite an existing interactionId" restriction, so it can freely replace the
   * placeholder marker with the real PayPal id — the wrapped call would refuse that even if the
   * placeholder's state did match.
   */
  private async writeSettledOrderTransaction(
    payment: Payment,
    response: Order,
    config: {
      operation: "authorizeOrder" | "captureOrder" | "createOrder";
      purchaseUnitKey: "authorizations" | "captures";
      transactionType: "Authorization" | "Charge";
      mapStatus: (status?: string) => TransactionState;
    }
  ): Promise<void> {
    const transaction = extractPayPalPurchaseUnitTransaction(
      response.purchase_units,
      config.purchaseUnitKey
    );
    const newState = config.mapStatus(transaction?.status);

    const placeholder = payment.transactions.find(
      (t) =>
        t.type === config.transactionType &&
        isPlaceholderInteractionId(t.interactionId)
    );

    const writeTransactionPromise = placeholder
      ? paymentSDK.ctAPI.client
          .payments()
          .withId({ ID: payment.id })
          .post({
            body: {
              version: payment.version,
              actions: [
                {
                  action: "changeTransactionState" as const,
                  transactionId: placeholder.id,
                  state: newState,
                },
                ...(transaction?.id
                  ? [
                      {
                        action: "changeTransactionInteractionId" as const,
                        transactionId: placeholder.id,
                        interactionId: transaction.id,
                      },
                    ]
                  : []),
              ],
            },
          })
          .execute()
      : this.ctPaymentService.updatePayment({
          id: payment.id,
          transaction: {
            type: config.transactionType,
            amount: payment.amountPlanned,
            interactionId: transaction?.id,
            state: newState,
          },
        });

    // updatePayment/the raw call above and syncPayPalOrderStatus both write the same Payment
    // resource — sequenced; linkVaultedCardCustomer writes a different entity (Customer/
    // PaymentMethod), so it stays parallel.
    await Promise.all([
      writeTransactionPromise,
      this.linkVaultedCardCustomer(payment, response),
    ]);
    await retryCTSync(
      () => this.syncPayPalOrderStatus(payment.id, response, true),
      config.operation,
      payment.id,
      response.status ?? ""
    );
  }

  /**
   * Fetches the payment, checks the caller-supplied orderID actually belongs to it, then
   * delegates to applyPayPalOrderTransaction() and shapes the result for authorizeOrder()/
   * captureOrder() — including the optional merchantReturnUrl convenience. Always uses the plain
   * fallback chain (session return url, then static MERCHANT_RETURN_URL) regardless of
   * builderType — deliberately never PAYPAL_ONAPPROVE_PREFIX here. That config now means
   * exclusively "the PayPal Express pre-finalize legal-review-page target" (see expressApprove()),
   * not a general post-finalize Express override; reusing it here would send the buyer to that
   * same review page again *after* authorizeOrder()/captureOrder() already ran (feature-disabled
   * or no-URL-configured fallback cases), which makes no sense once the payment is already done.
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

    // Ownership is checked against PayPalOrderId — unlike interfaceId, it's kept current on every
    // createOrder() call (a payment can get more than one PayPal order across its lifetime, e.g.
    // the buyer reopens the popup), so it always reflects the order actually meant to be finalized
    // here. The interfaceId-based "already linked to a different order" guard runs separately,
    // inside applyPayPalOrderTransaction.
    this.assertIsCurrentPayPalOrder(payment, orderID);

    let response: Order;
    try {
      response = await this.applyPayPalOrderTransaction(
        payment,
        orderID,
        config
      );
    } catch (error) {
      const notYetApprovedStatus =
        error instanceof ErrorInvalidOperation &&
        (error.fields as { orderID?: string; orderStatus?: string })
          ?.orderStatus;
      if (notYetApprovedStatus) {
        // Confirmed via getPayPalOrder (in applyPayPalOrderTransaction's catch) that PayPal's own
        // backend hadn't caught up with the buyer's approval yet — respond with the normal
        // success-shaped response instead of an HTTP error, so the enabler's
        // existing orderData.status !== "COMPLETED" handling shows a proper failure result instead
        // of losing this message to processorRequest's swallow-on-non-2xx behavior (see
        // enabler/src/api/request.ts). No merchantReturnUrl: handleOnApprove in usePayment.tsx
        // redirects on merchantReturnUrl before ever checking orderData.status, which would abandon
        // the order before any capture/authorize was attempted.
        return {
          orderData: {
            id: orderID,
            status: notYetApprovedStatus,
            message: error.message,
          },
        };
      }
      throw error;
    }

    // No merchantReturnUrl: handleOnApprove redirects on it before checking orderData.status, so
    // the enabler's orderData.status !== "COMPLETED" handling shows a failure instead
    const failedStatus = this.findFailedSettlementStatus(response, config);
    if (failedStatus) {
      return {
        orderData: {
          id: response.id ?? "",
          status: failedStatus,
          message: `PayPal ${config.transactionType} ${failedStatus}`,
        },
      };
    }

    return {
      orderData: { id: response.id ?? "", status: response.status ?? "" },
      merchantReturnUrl: this.buildRedirectMerchantUrl(
        payment.id,
        response.status
      ),
    };
  }

  /**
   * A COMPLETED order can still carry a DECLINED/FAILED capture or authorization — returns that
   * status when the purchase unit's transaction maps to a commercetools Failure, else undefined.
   */
  private findFailedSettlementStatus(
    response: Order,
    config: {
      purchaseUnitKey: "authorizations" | "captures";
      mapStatus: (status?: string) => TransactionState;
    }
  ): string | undefined {
    const transaction = extractPayPalPurchaseUnitTransaction(
      response.purchase_units,
      config.purchaseUnitKey
    );
    return config.mapStatus(transaction?.status) === "Failure"
      ? transaction?.status ?? "FAILED"
      : undefined;
  }

  /**
   * The CT Checkout session's own merchantReturnUrl, falling back to the static
   * MERCHANT_RETURN_URL config — shared by buildRedirectMerchantUrl (post-approval buyer
   * redirect) and createOrder (experience_context.return_url/cancel_url, see buildOrderRequest).
   */
  private resolveMerchantReturnBaseUrl(): string | undefined {
    return getMerchantReturnUrlFromContext() || getConfig().returnUrl;
  }

  /**
   * True whenever PayPal Express has an actual review step configured after buyer approval —
   * either the PAYPAL_REDIRECT_ON_APPROVE master switch, or just PAYPAL_ONAPPROVE_PREFIX being
   * set (configuring a review-page target is itself enough signal, no need to also flip a
   * separate switch). Single source of truth for config()'s exposed `redirectOnApprove` and
   * createOrder()'s experience_context.user_action — see both call sites' own comments.
   */
  private hasExpressReviewStep(): boolean {
    return getConfig().redirectOnApprove || !!getConfig().onApprovePrefix;
  }

  /**
   * Builds a buyer-facing redirect URL, appending paymentReference/paymentStatus query params.
   * Falls back to the CT Checkout session's own merchantReturnUrl, then the static
   * MERCHANT_RETURN_URL config. `approveUrlOverride` takes priority over both when passed — today
   * only expressApprove() passes one (PAYPAL_ONAPPROVE_PREFIX, the PayPal Express pre-finalize
   * legal-review-page target); finalizeOrder()'s post-finalize call deliberately never does, so
   * that config stays scoped to the one flow it's meant for.
   */
  private buildRedirectMerchantUrl(
    paymentReference: string,
    paymentStatus?: string,
    approveUrlOverride?: string
  ): string | undefined {
    const baseUrl = approveUrlOverride || this.resolveMerchantReturnBaseUrl();
    if (!baseUrl?.length) return undefined;
    const redirectUrl = new URL(baseUrl);
    redirectUrl.searchParams.append("paymentReference", paymentReference);
    if (paymentStatus) {
      redirectUrl.searchParams.append("paymentStatus", paymentStatus);
    }
    return redirectUrl.toString();
  }

  // Buyer-approved moment: applyPayPalOrderTransaction (via finalizeOrder) adds a commercetools
  // Authorization transaction here, which is what triggers commercetools Checkout to create the
  // commercetools Order, and whose interactionId settlement() later looks up to capture.
  public async authorizeOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO> {
    return this.finalizeOrder(request, {
      operation: "authorizeOrder",
      callPayPal: (orderID) => authorizePayPalOrder(orderID, {}),
      ...resolvePayPalIntentTransactionConfig("Authorize"),
    });
  }

  // Immediate-capture counterpart to authorizeOrder, used when the configured PayPal intent is
  // Capture rather than Authorize. Adds a commercetools Charge transaction, which is what
  // triggers commercetools Checkout to create the commercetools Order for this flow.
  public async captureOrder(
    request: OnApproveRequestSchemaDTO
  ): Promise<OnApproveResponseSchemaDTO> {
    return this.finalizeOrder(request, {
      operation: "captureOrder",
      callPayPal: (orderID) => capturePayPalOrder(orderID, {}),
      ...resolvePayPalIntentTransactionConfig("Capture"),
    });
  }

  /**
   * Adds a placeholder Authorization/Charge transaction to a payment, meant to trigger
   * commercetools Checkout's optimistic Order creation ahead of the real, indefinitely-delayed
   * authorize/capture. Used by expressApprove() for PayPal Express and by createOrder()'s PUI flow.
   *
   * State is "Pending", never "Initial" — cross-checked against commercetools' own official
   * reference connectors (Adyen, the generic template), every one of which only ever triggers Order
   * creation with a non-Initial state. interactionId is a PayPalOrderId-prefixed marker (see
   * buildPlaceholderInteractionId/isPlaceholderInteractionId in order.utils.ts) rather than left
   * empty, matching those same reference connectors always setting a real identifier on this first
   * transaction — PayPal just doesn't hand out the real authorization/capture id yet, so the order
   * id stands in until writeSettledOrderTransaction() finds and overwrites this placeholder in
   * place once the real authorize/capture completes.
   */
  private async addApprovalPlaceholderTransaction(
    payment: Payment,
    orderID: string,
    transactionType: "Authorization" | "Charge"
  ): Promise<void> {
    const hasPlaceholder = payment.transactions.some(
      (transaction) =>
        transaction.type === transactionType &&
        isPlaceholderInteractionId(transaction.interactionId)
    );

    const actions: PaymentUpdateAction[] = [
      ...(hasPlaceholder
        ? []
        : [
            {
              action: "addTransaction" as const,
              transaction: {
                type: transactionType,
                state: "Pending" as const,
                interactionId: buildPlaceholderInteractionId(orderID),
                amount: {
                  centAmount: payment.amountPlanned.centAmount,
                  currencyCode: payment.amountPlanned.currencyCode,
                },
              },
            },
          ]),
      ...(payment.interfaceId
        ? []
        : [{ action: "setInterfaceId" as const, interfaceId: orderID }]),
    ];
    if (actions.length) {
      await paymentSDK.ctAPI.client
        .payments()
        .withId({ ID: payment.id })
        .post({
          body: {
            version: payment.version,
            actions,
          },
        })
        .execute();
    }
  }

  /**
   * PayPal Express only, gated by PAYPAL_REDIRECT_ON_APPROVE (default off).
   * Called from handleOnApprove at approval time, *instead of*
   * authorizeOrder()/captureOrder() — the real authorize/capture can happen later, triggered by the
   * merchant's own backend via the Payment Intents API → settlement() or extension app,
   * once the buyer has reviewed on that page.
   *
   * The buyer has already approved the order on PayPal's side at this point — this triggers an
   * optimistic CT Order creation ahead of the real authorize/capture, using PayPalOrderId (the
   * only PayPal-side identifier available yet) as the payment's interfaceId.
   * The placeholder is added via a **raw CT API call**, not ctPaymentService.updatePayment() —
   * that wrapped helper silently discards a bare Initial-state transaction with no interactionId.
   * See addApprovalPlaceholderTransaction()'s own doc comment for the transaction shape (Pending
   * state, PayPalOrderId-marker interactionId) actually required to trigger Order creation.
   */
  public async expressApprove({
    paymentId,
    orderID,
    payPalIntent,
  }: ExpressApproveRequestSchemaDTO): Promise<ExpressApproveResponseSchemaDTO> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    // Ownership check (see assertIsCurrentPayPalOrder's own comment) — PayPalOrderId, not interfaceId.
    this.assertIsCurrentPayPalOrder(payment, orderID);
    // This *is* the approval moment for the Express+redirect flow — refuse to link a second order
    // to a payment that already completed a real authorize/capture via a different one (see
    // assertNotLinkedToDifferentOrder's own comment).
    this.assertNotLinkedToDifferentOrder(payment, orderID);

    const { transactionType } =
      resolvePayPalIntentTransactionConfig(payPalIntent);
    await this.addApprovalPlaceholderTransaction(
      payment,
      orderID,
      transactionType
    );

    return {
      onApproveRedirectionUrl: this.buildRedirectMerchantUrl(
        payment.id,
        undefined,
        getConfig().onApprovePrefix
      ),
    };
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

    // Ownership check (see assertIsCurrentPayPalOrder's own comment) — PayPalOrderId, not
    // interfaceId. Read-only otherwise, so no assertNotLinkedToDifferentOrder call — nothing gets
    // linked here.
    this.assertIsCurrentPayPalOrder(payment, orderID);

    let order: Order;
    try {
      order = await getPayPalOrder(orderID);
    } catch (e) {
      void this.logProcessorInteraction(
        payment.id,
        "getPayPalOrder",
        { orderID },
        undefined,
        e,
        orderID
      );
      throw new ErrorInvalidOperation(
        `Failed to look up PayPal order ${orderID}`
      );
    }

    await this.logProcessorInteraction(
      payment.id,
      "getPayPalOrder",
      { orderID },
      order,
      undefined,
      orderID
    );

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
   * Applies commercetools cart-update actions via the raw client call (ctCartService has no
   * generic update method suitable for PayPal onShippingChange) and returns the updated cart.
   */
  private async applyCartUpdate(
    cart: Cart,
    actions: CartUpdateAction[]
  ): Promise<Cart> {
    try {
      const updatedCart = await paymentSDK.ctAPI.client
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions,
          },
        })
        .execute();
      return updatedCart.body;
    } catch (e) {
      log.error(
        `updateShipping: cart update failed for cart ${
          cart.id
        } — ${errorMessage(e)}`
      );
      throw new ErrorInvalidOperation(
        `Failed to update cart ${cart.id}: ${errorMessage(e)}`
      );
    }
  }

  /**
   * Resolves the shipping method/options for updateShipping: applies whatever the request
   * already tells the cart (address and/or an already-chosen method), then if address changes
   * refetches available shipping methods
   */
  private async resolveShippingSelection(
    ctCart: Cart,
    {
      address,
      shippingMethodId,
      clientShippingOptions,
    }: {
      address?: UpdateShippingRequestSchemaDTO["address"];
      shippingMethodId?: string;
      clientShippingOptions?: PayPalShippingOption[];
    }
  ): Promise<{
    updatedCtCart: Cart;
    shippingOptions: PayPalShippingOption[];
  }> {
    const initialActions: CartUpdateAction[] = [];
    if (address) {
      initialActions.push({
        action: "setShippingAddress" as const,
        address: {
          country: address.countryCode,
          ...(address.postalCode && { postalCode: address.postalCode }),
          ...(address.city && { city: address.city }),
          ...(address.state && { state: address.state }),
        },
      });
    }
    if (shippingMethodId) {
      initialActions.push(buildSetShippingMethodAction(shippingMethodId));
    }
    let updatedCtCart = await this.applyCartUpdate(ctCart, initialActions);

    const hasTrustworthyClientOptions =
      !address &&
      !!shippingMethodId &&
      !!clientShippingOptions?.some((opt) => opt.id === shippingMethodId);

    const shippingOptions = hasTrustworthyClientOptions
      ? clientShippingOptions!.map((opt) => ({
          ...opt,
          selected: opt.id === shippingMethodId,
        }))
      : await fetchPayPalShippingOptionsForCart({
          ctApiClient: paymentSDK.ctAPI.client,
          cartId: updatedCtCart.id,
          currentMethodId: shippingMethodId,
        });

    if (!shippingOptions.length) {
      throw new ErrorInvalidOperation(
        `No shipping methods available for cart ${ctCart.id}`
      );
    }

    if (!shippingMethodId) {
      // Pure address change — the buyer hasn't picked an option yet. Resolve the default
      // matchingCart marked as selected and assign it now, so totals below include shipping.
      const defaultMethodId = shippingOptions.find((opt) => opt.selected)?.id;
      if (!defaultMethodId) {
        throw new ErrorInvalidOperation("No shipping method could be selected");
      }
      updatedCtCart = await this.applyCartUpdate(updatedCtCart, [
        buildSetShippingMethodAction(defaultMethodId),
      ]);
    }

    return { updatedCtCart, shippingOptions };
  }

  /**
   * Optimistically determines from ct state if "add" or "replace" should be used to update
   * PayPal order, if the method was wrong - retries with correct.
   */
  private failPatchPayPalOrderShipping(
    e: unknown,
    orderID: string,
    paymentId: string,
    patches: Patch[]
  ): never {
    void this.logProcessorInteraction(
      paymentId,
      "updatePayPalOrder",
      patches,
      undefined,
      e,
      orderID
    );
    throw new ErrorInvalidOperation(`Failed to update PayPal order ${orderID}`);
  }

  private async patchPayPalOrderShipping(
    orderID: string,
    paymentId: string,
    buildPatches: (shippingOptionsOp: "add" | "replace") => Patch[],
    assumedOp: "add" | "replace"
  ): Promise<void> {
    const patches = buildPatches(assumedOp);
    try {
      const response = await updatePayPalOrder(orderID, patches);
      await this.logProcessorInteraction(
        paymentId,
        "updatePayPalOrder",
        patches,
        response,
        undefined,
        orderID
      );
    } catch (e) {
      if (!isPayPalInvalidPatchOperationError(e)) {
        this.failPatchPayPalOrderShipping(e, orderID, paymentId, patches);
      }

      const correctedOp = assumedOp === "add" ? "replace" : "add";
      log.warn(
        `updateShipping: assumed op "${assumedOp}" was wrong for order ${orderID} (cart's shippingInfo didn't reflect the order's actual state) — retrying with "${correctedOp}"`
      );
      const correctedPatches = buildPatches(correctedOp);
      try {
        const response = await updatePayPalOrder(orderID, correctedPatches);
        await this.logProcessorInteraction(
          paymentId,
          "updatePayPalOrder",
          correctedPatches,
          response,
          undefined,
          orderID
        );
      } catch (retryError) {
        this.failPatchPayPalOrderShipping(
          retryError,
          orderID,
          paymentId,
          correctedPatches
        );
      }
    }
  }

  // Pre-approval cart/PayPal-order mutation only — like createOrder, must never add a
  // commercetools transaction (see abstract-payment.service.ts).
  public async updateShipping(
    request: UpdateShippingRequestSchemaDTO
  ): Promise<UpdateShippingResponseSchemaDTO> {
    const {
      paymentId,
      orderID,
      address,
      shippingMethodId,
      shippingOptions: clientShippingOptions,
    } = request;

    if (!address && !shippingMethodId) {
      throw new ErrorInvalidOperation(
        `updateShipping requires either address or shippingMethodId, neither provided for payment ${paymentId}`
      );
    }

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const { updatedCtCart, shippingOptions } =
      await this.resolveShippingSelection(ctCart, {
        address,
        shippingMethodId,
        clientShippingOptions,
      });

    // Recompute totals and price breakdown from the final cart state
    const amount = await this.ctCartService.getPaymentAmount({
      cart: updatedCtCart,
    });
    const breakdown = mapCommercetoolsCartToPayPalPriceBreakdown(updatedCtCart);
    const paypalAmount = buildPayPalAmount(amount);

    const buildPatches = (shippingOptionsOp: "add" | "replace"): Patch[] => [
      {
        op: "replace",
        path: "/purchase_units/@reference_id=='default'/amount",
        value: {
          ...paypalAmount,
          ...(breakdown && { breakdown }),
        },
      },
      {
        op: shippingOptionsOp,
        path: "/purchase_units/@reference_id=='default'/shipping/options",
        value: shippingOptions,
      },
    ];

    const assumedOp = ctCart.shippingInfo
      ? ("replace" as const)
      : ("add" as const);
    await this.patchPayPalOrderShipping(
      orderID,
      paymentId,
      buildPatches,
      assumedOp
    );

    log.info(
      `updateShipping: success, paymentId: ${paymentId}, cartId: ${ctCart.id}`
    );
    return {
      shippingOptions,
      amount: paypalAmount,
      breakdown: {
        ...(breakdown?.item_total && { item_total: breakdown.item_total }),
        shipping: breakdown?.shipping || {
          currency_code: amount.currencyCode,
          value: "0",
        },
        ...(breakdown?.tax_total && { tax_total: breakdown.tax_total }),
        ...(breakdown?.discount && { discount: breakdown.discount }),
      },
    };
  }

  /**
   * Applies setInterfaceId / setCustomField(PayPalOrderId) / setStatusInterfaceCode /
   * setStatusInterfaceText / setMethodInfoMethod via a raw CT API call — connect-payments-sdk's
   * generic updatePayment() does not expose the status actions. Re-fetches the payment for a fresh
   * version on every call so retryCTSync's retries avoid version conflicts. Used to sync the data
   * with connect format to keep full compatibility with connect modules.
   *
   * `linkInterfaceId` is true only when called after a confirmed successful authorize/capture
   * (applyPayPalOrderTransaction) — never from createOrder(), since a payment can get more than one
   * PayPal order across its lifetime (e.g. the buyer reopens the popup after an earlier attempt)
   * and commercetools permanently rejects changing interfaceId once set. PayPalOrderId (mirrors
   * paypal-commercetools-extension's own field) is synced unconditionally in both contexts instead —
   * it's what the ownership checks elsewhere (finalizeOrder/expressApprove/authenticateThreeDSOrder)
   * read, since it's always current.
   */
  private async syncPayPalOrderStatus(
    paymentId: string,
    response: Order,
    linkInterfaceId: boolean
  ): Promise<void> {
    const payment = await this.ctPaymentService.getPayment({ id: paymentId });

    const actions: PaymentUpdateAction[] = [
      // Only ever attempted at the moment of actual approval (linkInterfaceId: true) — never
      // speculatively at createOrder() time. See this function's own doc comment.
      ...(linkInterfaceId && response.id && !payment.interfaceId
        ? [{ action: "setInterfaceId" as const, interfaceId: response.id }]
        : []),
      // Always current, unlike interfaceId — this is what ownership checks elsewhere read.
      ...(response.id
        ? [
            {
              action: "setCustomField" as const,
              name: "PayPalOrderId",
              value: response.id,
            },
          ]
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

  public async settlement(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentIntentResponseSchemaDTO> {
    const { payment: ctPayment, amount } = request;

    const settings = await this.resolveSettings();
    const intent =
      settings?.payPalIntent === "Authorize"
        ? CheckoutPaymentIntent.Authorize
        : CheckoutPaymentIntent.Capture;
    const authorizationTransaction = findMostRecentTransaction(
      ctPayment,
      "Authorization",
      "Success"
    );
    // Intent-first: capture when the configured intent is Capture, or when something's already
    // been authorized (second call under Authorize intent). This also covers a merchant driving
    // capturePayment directly via commercetools' Payment Intents API before anything's been
    // authorized (e.g. behind the PayPal-Express legal-review redirect, see enabler/README.md),
    // since that API has no separate "authorize" action of its own.
    const shouldCapture =
      intent === CheckoutPaymentIntent.Capture || !!authorizationTransaction;

    if (!shouldCapture) {
      // intent === Authorize, nothing authorized yet — first call.
      if (!ctPayment.interfaceId) {
        throw new ErrorInvalidOperation(
          `Payment ${ctPayment.id} has no associated PayPal order to settle`
        );
      }
      await this.applyPayPalOrderTransaction(ctPayment, ctPayment.interfaceId, {
        operation: "authorizeOrder",
        callPayPal: (id) => authorizePayPalOrder(id, {}),
        ...resolvePayPalIntentTransactionConfig("Authorize"),
      });
      return { outcome: PaymentModificationStatus.APPROVED };
    }

    if (authorizationTransaction) {
      const authorizationId = findAuthorizationTransactionId(ctPayment);
      if (!ctPayment.interfaceId) {
        throw new ErrorInvalidOperation(
          `Payment ${ctPayment.id} has no associated PayPal order to settle`
        );
      }
      await this.ensureOrderApproved(
        ctPayment.interfaceId,
        ctPayment.id,
        "settlement"
      );

      // `amount` (from the commercetools Payment Intents request) has no fractionDigits of its own —
      const paypalAmount = buildPayPalAmount(
        amount,
        ctPayment.amountPlanned.fractionDigits
      );

      let response: Capture2;
      try {
        response = await capturePayPalAuthorization(authorizationId, {
          amount: paypalAmount,
        });
      } catch (e) {
        void this.logProcessorInteraction(
          ctPayment.id,
          "capturePayPalAuthorization",
          { authorizationId, amount: paypalAmount },
          undefined,
          e,
          ctPayment.interfaceId,
          "settlement"
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
      // Logged after, unawaited — same reasoning as applyPayPalOrderTransaction/createOrder.
      void this.logProcessorInteraction(
        ctPayment.id,
        "capturePayPalAuthorization",
        { authorizationId, amount: paypalAmount },
        response,
        undefined,
        ctPayment.interfaceId,
        "settlement"
      );

      return { outcome: PaymentModificationStatus.APPROVED };
    }

    // intent === Capture, nothing authorized (e.g. first call under Capture intent via the
    // redirect flow).
    if (!ctPayment.interfaceId) {
      throw new ErrorInvalidOperation(
        `Payment ${ctPayment.id} has no associated PayPal order to settle`
      );
    }
    await this.applyPayPalOrderTransaction(ctPayment, ctPayment.interfaceId, {
      operation: "captureOrder",
      callPayPal: (id) => capturePayPalOrder(id, {}),
      ...resolvePayPalIntentTransactionConfig("Capture"),
    });
    return { outcome: PaymentModificationStatus.APPROVED };
  }

  async refundPayment(
    request: ModifyPaymentWithTransactionRequest
  ): Promise<PaymentIntentResponseSchemaDTO> {
    const { payment: ctPayment, amount, transactionId } = request;
    const paypalTransactionId = findRefundableTransactionId(
      ctPayment,
      transactionId
    );

    const paypalAmount = buildPayPalAmount(
      amount,
      ctPayment.amountPlanned.fractionDigits
    );
    const refundRequest: RefundRequest = { amount: paypalAmount };

    let response: Refund;
    try {
      response = await refundPayPalOrder(paypalTransactionId, refundRequest);
    } catch (e) {
      void this.logProcessorInteraction(
        ctPayment.id,
        "refundPayPalOrder",
        refundRequest,
        undefined,
        e,
        ctPayment.interfaceId
      );
      throw new ErrorInvalidOperation(
        `Failed to refund PayPal transaction ${paypalTransactionId}`
      );
    }

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: "Refund",
        amount,
        interactionId: response.id,
        state: mapPayPalRefundStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    });
    void this.logProcessorInteraction(
      ctPayment.id,
      "refundPayPalOrder",
      refundRequest,
      response,
      undefined,
      ctPayment.interfaceId
    );

    return { outcome: PaymentModificationStatus.APPROVED };
  }

  async void(
    request: CancelPaymentRequest
  ): Promise<PaymentIntentResponseSchemaDTO> {
    const { payment: ctPayment } = request;

    const transaction = findVoidableTransaction(ctPayment);
    const voidRequest = { authorizationId: transaction.interactionId };

    let response: Authorization2;
    try {
      response = await voidPayPalAuthorization(transaction.interactionId);
    } catch (e) {
      void this.logProcessorInteraction(
        ctPayment.id,
        "voidPayPalAuthorization",
        voidRequest,
        undefined,
        e,
        ctPayment.interfaceId
      );
      throw new ErrorInvalidOperation(
        `Failed to void PayPal authorization ${transaction.interactionId}`
      );
    }

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        amount: transaction.amount,
        type: "CancelAuthorization",
        interactionId: transaction.interactionId,
        state: mapPayPalVoidStatusToCommercetoolsTransactionState(
          response.status
        ),
      },
    });
    void this.logProcessorInteraction(
      ctPayment.id,
      "voidPayPalAuthorization",
      voidRequest,
      response,
      undefined,
      ctPayment.interfaceId
    );

    return { outcome: PaymentModificationStatus.APPROVED };
  }

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

    const ctCustomerId = ctCart.customerId;

    try {
      const paymentTokensResponse = await getPaymentTokens(paypalCustomerId);
      void this.logProcessorCustomerInteraction(
        ctCustomerId,
        "getPaymentTokens",
        { customerId: paypalCustomerId },
        paymentTokensResponse
      );
      const { payment_tokens: paymentTokens = [] } = paymentTokensResponse;
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
              paymentInterface:
                getStoredPaymentMethodsConfig().config.paymentInterface,
            })
            .then((result) => result.results)
            .catch(() => [])
        : [];

      const storedPaymentMethods = cardTokens.map((token) => {
        const createdAt = resolveStoredPaymentMethodCreatedAt(
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
        )}${payPalDebugIdSuffix(e)}`
      );
      void this.logProcessorCustomerInteraction(
        ctCustomerId,
        "getPaymentTokens",
        { customerId: paypalCustomerId },
        buildErrorResponsePayload(e)
      );
      return { storedPaymentMethods: [] };
    }
  }

  public async deleteStoredPaymentMethod(token: string): Promise<void> {
    const cartId = getCartIdFromContext();
    // Promise.allSettled (not Promise.all) — unlike Promise.all, this keeps the cart (and thus
    // customerId) available below even when the PayPal delete itself rejects, so the failure can
    // still be logged onto the CT customer. The cart is only ever used best-effort here (mirror
    // cleanup, and now audit logging), never to authorize the deletion itself.
    const [deleteResult, cartResult] = await Promise.allSettled([
      deletePaymentToken(token),
      this.ctCartService.getCart({ id: cartId }).catch(() => undefined),
    ]);
    const ctCart: Cart | undefined =
      cartResult.status === "fulfilled" ? cartResult.value : undefined;

    if (deleteResult.status === "rejected") {
      const e = deleteResult.reason;
      log.error(
        `deleteStoredPaymentMethod: failed, cartId: ${
          ctCart?.id ?? cartId ?? "unavailable"
        } — ${errorMessage(e)}${payPalDebugIdSuffix(e)}`
      );
      if (ctCart?.customerId) {
        void this.logProcessorCustomerInteraction(
          ctCart.customerId,
          "deletePaymentToken",
          { paymentToken: token },
          buildErrorResponsePayload(e)
        );
      }
      throw e;
    }

    log.info(
      `deleteStoredPaymentMethod: success, cartId: ${
        ctCart?.id ?? cartId ?? "unavailable"
      }`
    );

    if (ctCart?.customerId) {
      const customerId = ctCart.customerId;
      void this.logProcessorCustomerInteraction(
        customerId,
        "deletePaymentToken",
        { paymentToken: token },
        deleteResult.value
      );

      // Best-effort mirror cleanup of the commercetools-native PaymentMethod record, if one
      // exists. The PayPal deletion above already succeeded and is the authoritative action;
      // this fire-and-forget cleanup just keeps commercetools from holding a stale reference.
      void this.ctPaymentMethodService
        .getByTokenValue({
          customerId,
          tokenValue: token,
          paymentInterface:
            getStoredPaymentMethodsConfig().config.paymentInterface,
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
            `deleteStoredPaymentMethod: no matching commercetools PaymentMethod record: ${errorMessage(
              e
            )}`
          )
        );
    }
  }
}
