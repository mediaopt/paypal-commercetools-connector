import React, {
  FC,
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import type { FUNDING_SOURCE } from "@paypal/paypal-js/types/components/funding-eligibility";

import { redirectTo } from "../helpers/redirectTo";
import { sessionHeader } from "../helpers/sessionHeader";
import { Result } from "../components/Result";
import {
  GeneralComponentsProps,
  ProviderErrorProps,
  PaymentInfo,
  CartInformationInitial,
  CreatePaymentResponse,
  RequestHeader,
  ClientTokenRequest,
  ClientTokenResponse,
  CustomOnApproveData,
  OnApproveRequest,
  OnApproveResponse,
  ExpressApproveRequest,
  ExpressApproveResponse,
  CustomOrderData,
  CreateOrderRequest,
  CreateOrderResponse,
  CreateVaultSetupTokenRequest,
  CreateVaultSetupTokenResponse,
  ApproveVaultSetupTokenData,
  ApproveVaultSetupTokenRequest,
  ApproveVaultSetupTokenResponse,
  CreateInvoiceData,
  OrderDataLinks,
  OrderData,
  BuilderType,
  UpdateShippingRequest,
  UpdateShippingResponse,
} from "../types";
import { processorRequest } from "../services/processorRequest";
import { processorUrls } from "../components/constants";

import { useLoader } from "./useLoader";
import { useNotifications } from "./useNotifications";
import { useSettings } from "./useSettings";
import { getActionIndex } from "../components/CardFields/constants";
import { useTranslation } from "react-i18next";
import { handleResponseError } from "../messages/errorMessages";

const PaymentInfoInitialObject: PaymentInfo = {
  id: "",
  amountPlanned: { centAmount: 0, currencyCode: "", fractionDigits: 0 },
  cartInformation: CartInformationInitial,
};

const toPaymentInfo = (
  payment: CreatePaymentResponse,
  cartInformation: PaymentInfo["cartInformation"]
): PaymentInfo => ({
  id: payment.id,
  amountPlanned: payment.amountPlanned,
  lineItems: payment.lineItems,
  email: payment.email,
  firstName: payment.firstName,
  lastName: payment.lastName,
  countryCode: payment.countryCode,
  shippingAddress: payment.shippingAddress,
  shippingOptions: payment.shippingOptions,
  priceBreakdown: payment.priceBreakdown,
  ctCustomerId: payment.ctCustomerId,
  customerVersion: payment.customerVersion,
  version: payment.version,
  cartInformation,
});

type PaymentContextT = {
  paymentInfo: PaymentInfo;
  requestHeader: RequestHeader;
  clientToken: string;
  handleCreateOrder: (
    orderData?: CustomOrderData,
    forceCheckoutReportError?: boolean
  ) => Promise<string>;
  handleOnApprove: (
    data: CustomOnApproveData,
    forceCheckoutReportError?: boolean
  ) => Promise<void>;
  vaultOnly: boolean;
  orderDataLinks?: OrderDataLinks;
  handleCreateVaultSetupToken: (
    paymentSource: FUNDING_SOURCE
  ) => Promise<string>;
  handleApproveVaultSetupToken: (
    data: ApproveVaultSetupTokenData
  ) => Promise<void>;
  handleAuthenticateThreeDSOrder: (orderID: string) => Promise<number>;
  handleUpdateShipping: (
    request: UpdateShippingRequest
  ) => Promise<UpdateShippingResponse>;
  resolveShippingOptionId: (selectedOptionId: string) => string;
  orderId?: string;
  builderType?: BuilderType;
  // Set only in Checkout mode
  processorUrl?: string;
};

const setRelevantData = (
  orderData?: CustomOrderData,
  isInvoice?: boolean,
  enableVaulting?: boolean
) => {
  if (isInvoice) {
    return orderData as CreateInvoiceData;
  } else
    return {
      storeInVault: enableVaulting,
      ...orderData,
    };
};

const PaymentContext = createContext<PaymentContextT>({
  paymentInfo: PaymentInfoInitialObject,
  requestHeader: {},
  clientToken: "",
  handleCreateOrder: (orderData?: CustomOrderData) => Promise.resolve(""),
  handleOnApprove: () => Promise.resolve(),
  vaultOnly: false,
  handleCreateVaultSetupToken: (paymentSource: FUNDING_SOURCE) =>
    Promise.resolve(""),
  handleApproveVaultSetupToken: (data?: ApproveVaultSetupTokenData) =>
    Promise.resolve(),
  handleAuthenticateThreeDSOrder: (orderID: string) => Promise.resolve(0),
  handleUpdateShipping: (request: UpdateShippingRequest) =>
    Promise.resolve({
      shippingOptions: [],
      amount: { currency_code: "", value: "" },
      breakdown: { shipping: { currency_code: "", value: "" } },
    }),
  resolveShippingOptionId: (selectedOptionId: string) => selectedOptionId,
  orderDataLinks: undefined,
  orderId: undefined,
  builderType: undefined,
});

export const PaymentProvider: FC<
  React.PropsWithChildren<GeneralComponentsProps & ProviderErrorProps>
> = ({
  children,
  purchaseCallback,

  createPaymentUrl,
  createOrderUrl,
  getOrderUrl,
  authorizeOrderUrl,
  authenticateThreeDSOrderUrl,

  onApproveUrl,
  onApproveRedirectionUrl,

  createVaultSetupTokenUrl,
  approveVaultSetupTokenUrl,

  getClientTokenUrl,
  requestHeader: initialRequestHeader,
  shippingMethodId,
  cartInformation,

  enableVaulting,
  paymentMethodType,
  builderType,
  processorUrl,
  redirectOnApprove,
  initialPayment,
  onExpressPayButtonClick,
  onError,
}) => {
  // Replaced only by handleCreateOrder's PayPal Express session switch
  const [requestHeader, setRequestHeader] = useState(initialRequestHeader);
  const [clientToken, setClientToken] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState<boolean>();
  const [resultMessage, setResultMessage] = useState<string>();
  const [orderDataLinks, setOrderDataLinks] = useState<OrderDataLinks>();
  const [orderId, setOrderId] = useState<string>();

  const { settings } = useSettings();

  // Seeded synchronously from initialPayment when present (Checkout mode — already resolved in
  // PayPalPaymentEnabler._Setup() before this component ever mounts, see BaseOptions's own
  // comment). Falls back to PaymentInfoInitialObject otherwise, populated by the mount effect
  // below instead (self-hosted/legacy mode).
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(
    initialPayment
      ? toPaymentInfo(initialPayment, cartInformation)
      : PaymentInfoInitialObject
  );

  const { isLoading } = useLoader();
  const { notify } = useNotifications();
  const { t } = useTranslation();

  const onSuccess = (orderData: OrderData) => {
    setShowResult(true);
    setResultSuccess(true);
    purchaseCallback?.(orderData);
  };

  /** @deprecated Legacy leftover from the pre-Checkout npm-client era. Always resolves to
   * `undefined` against this processor (traces back to `paymentInfo.version`, itself sourced from
   * `CreatePaymentResponse.version` — already @deprecated, never sent by this processor). Kept for
   * now for a self-hosted backend that might still track it. */
  let latestPaymentVersion = paymentInfo.version;

  useEffect(() => {
    if (showResult) {
      isLoading(false);
    }
  }, [showResult]);

  const derivedUrls: Partial<ReturnType<typeof processorUrls>> = processorUrl
    ? processorUrls(processorUrl)
    : {};
  const vaultOnly: boolean = !!(
    createVaultSetupTokenUrl && approveVaultSetupTokenUrl
  );

  const createPayment = async (header: RequestHeader) => {
    const createPaymentResult = await processorRequest<
      {},
      CreatePaymentResponse
    >(
      header,
      createPaymentUrl,
      // Checkout mode: processor's InitPaymentRequestSchema is {}
      processorUrl
        ? {}
        : {
            ...cartInformation,
            shippingMethodId: shippingMethodId,
            paymentMethodType,
            builderType,
          }
    );

    if (!createPaymentResult) {
      throw new Error(t("payPal.generalError"));
    }

    let paymentVersion: number | undefined = createPaymentResult.version;
    if (getClientTokenUrl) {
      const clientTokenResult = (await processorRequest<
        ClientTokenRequest,
        ClientTokenResponse
      >(header, getClientTokenUrl, {
        paymentId: createPaymentResult.id,
        paymentVersion: createPaymentResult.version,
        braintreeCustomerId: createPaymentResult.braintreeCustomerId,
        merchantAccountId: undefined,
      })) as ClientTokenResponse;
      setClientToken(clientTokenResult.clientToken);
      paymentVersion = clientTokenResult.paymentVersion;
    }

    setPaymentInfo({
      ...toPaymentInfo(createPaymentResult, cartInformation),
      version: paymentVersion,
    });
    return createPaymentResult;
  };

  // Self-hosted/legacy mode only — Checkout mode always has initialPayment already seeded above
  // by the time this component mounts (resolved in _Setup(), before any builder is ever
  // constructed), so this fetch never runs there.
  useEffect(() => {
    if (vaultOnly || initialPayment) return;

    const initPayment = async () => {
      isLoading(true);
      try {
        await createPayment(requestHeader);
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
      } finally {
        isLoading(false);
      }
    };
    initPayment();
  }, []);

  const value = useMemo(() => {
    const handleCreateVaultSetupToken = async (
      paymentSource: FUNDING_SOURCE
    ) => {
      if (!createVaultSetupTokenUrl) return "";
      try {
        const createVaultSetupTokenResult = await processorRequest<
          CreateVaultSetupTokenRequest,
          CreateVaultSetupTokenResponse
        >(requestHeader, createVaultSetupTokenUrl, { paymentSource });

        return createVaultSetupTokenResult
          ? createVaultSetupTokenResult.createVaultSetupTokenResponse.id
          : "";
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
        return "";
      }
    };
    const handleApproveVaultSetupToken = async ({
      vaultSetupToken,
    }: ApproveVaultSetupTokenData) => {
      if (!approveVaultSetupTokenUrl) return;
      try {
        const result = await processorRequest<
          ApproveVaultSetupTokenRequest,
          ApproveVaultSetupTokenResponse
        >(requestHeader, approveVaultSetupTokenUrl, { vaultSetupToken });
        if (result) {
          setShowResult(true);
          setResultSuccess(true);
          purchaseCallback?.(result);
        } else {
          setShowResult(true);
          setResultSuccess(false);
        }
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
      }
    };

    const handleCreateOrder = async (
      orderData?: CustomOrderData,
      forceCheckoutReportError?: boolean
    ) => {
      if (!createOrderUrl) {
        if (forceCheckoutReportError) {
          throw new Error(t("payPal.generalError"));
        }
        return "";
      }
      const setRatepayMessage = orderData?.setRatepayMessage ?? undefined;
      let errorAlreadyShown = false;
      try {
        const relevantOrderData = setRelevantData(
          orderData,
          !!setRatepayMessage,
          enableVaulting
        );

        // PayPal Express only. Checkout's session from before the click has no checkout
        // transaction item, so a Payment created under it can't trigger Order creation. Switches
        // to the session onPayButtonClick hands back and creates a new Payment under it; this
        // request uses both directly, later calls pick them up from state.
        let orderRequestHeader = requestHeader;
        let orderPaymentId = paymentInfo.id;
        if (builderType === "express" && onExpressPayButtonClick) {
          const clickResult = await onExpressPayButtonClick();
          if (clickResult?.sessionId) {
            orderRequestHeader = sessionHeader(clickResult.sessionId);
            setRequestHeader(orderRequestHeader);
            orderPaymentId = (await createPayment(orderRequestHeader)).id;
          } else {
            console.warn(
              "[paypal-enabler] onPayButtonClick returned no sessionId — keeping the current session"
            );
          }
        }

        const createOrderResult = await processorRequest<
          CreateOrderRequest,
          CreateOrderResponse
        >(orderRequestHeader, createOrderUrl, {
          paymentId: orderPaymentId,
          paymentVersion: latestPaymentVersion,
          // PayUponInvoice must always submit Capture intent, regardless of the merchant's
          // global setting — fraudNetSessionId is the only PUI-exclusive field on orderData, so
          // its presence is a reliable signal this call originated from PUI.
          payPalIntent: orderData?.fraudNetSessionId
            ? "Capture"
            : settings?.payPalIntent,
          builderType,
          paymentMethodType,
          orderData: {
            ...relevantOrderData,
          },
        });

        if (
          !createOrderResult ||
          (createOrderResult && createOrderResult.ok === false)
        ) {
          throw new Error(t("interface.generalError"));
        }

        const oldOrderData = orderData;

        const {
          orderData: newOrderData,
          paymentVersion,
          merchantReturnUrl,
        } = createOrderResult;
        const { id, status, payment_source, details, links, message } =
          newOrderData;
        latestPaymentVersion = paymentVersion;

        if (!id) {
          // For the card-fields checkout path, setRatepayMessage is always undefined, so
          // handleResponseError (Ratepay/PUI-specific) always takes its `!showError` branch and
          // throws directly — the catch below's forceCheckoutReportError rethrow already covers that
          // case.
          handleResponseError(
            t,
            notify,
            details?.toString(),
            message,
            setRatepayMessage
          );
          isLoading(false);
          // PUI: handleResponseError surfaced the error itself instead of throwing
          if (forceCheckoutReportError) {
            errorAlreadyShown = true;
            throw new Error(message ?? t("invoice.thirdPartyIssue"));
          }
          return "";
        } else if (oldOrderData?.googlePayData) {
          //@ts-ignore
          const confirmOrderResult = await paypal.Googlepay().confirmOrder({
            orderId: newOrderData.id,
            paymentMethodData:
              oldOrderData.googlePayData.paymentData.paymentMethodData,
          });
          const { status } = confirmOrderResult;
          if (status === "APPROVED") {
            // handleOnApprove shows its own result and errors
            errorAlreadyShown = true;
            await handleOnApprove(
              { orderID: newOrderData.id },
              forceCheckoutReportError
            );
          } else if (
            oldOrderData?.googlePayData &&
            status === "PAYER_ACTION_REQUIRED"
          ) {
            // 3DS needs the Google Pay sheet closed, so it continues after handleCreateOrder
            // returns; handleOnApprove shows the final result itself. The sheet has already been
            // told SUCCESS by then, so failures reach Checkout only through onError.
            //@ts-ignore
            paypal
              .Googlepay()
              .initiatePayerAction({ orderId: newOrderData.id })
              .then(() => {
                handleAuthenticateThreeDSOrder(newOrderData.id, true)
                  .then((result) => {
                    switch (result.toString(10)) {
                      case "2":
                        handleOnApprove(
                          { orderID: newOrderData.id },
                          forceCheckoutReportError
                        ).catch((err) => {
                          console.error(
                            "GooglePay: handleOnApprove (3DS approved) failed",
                            err
                          );
                          onError?.({
                            code: "GOOGLE_PAY_APPROVE_FAILED",
                            message:
                              err instanceof Error
                                ? err.message
                                : t("interface.generalError"),
                          });
                        });
                        break;
                      case "1":
                        notify("Warning", t("cardFields.tryAgain"));
                        isLoading(false);
                        onError?.({
                          code: "THREE_DS_DECLINED_RETRY",
                          message: t("cardFields.tryAgain"),
                        });
                        break;
                      case "0":
                      default:
                        notify("Error", t("cardFields.selectDifferentMethod"));
                        isLoading(false);
                        onError?.({
                          code: "THREE_DS_DECLINED",
                          message: t("cardFields.selectDifferentMethod"),
                        });
                        break;
                    }
                  })
                  .catch((err) => {
                    console.error(
                      "GooglePay: handleAuthenticateThreeDSOrder failed",
                      err
                    );
                    onError?.({
                      code: "THREE_DS_FAILED",
                      message: t("interface.generalError"),
                    });
                  });
              })
              .catch((err: any) => {
                console.error("GooglePay: initiatePayerAction failed", err);
                onError?.({
                  code: "THREE_DS_FAILED",
                  message: t("interface.generalError"),
                });
              });
          } else {
            if (forceCheckoutReportError) {
              throw new Error(t("payPal.generalError"));
            }
            return "";
          }
        } else {
          if (setRatepayMessage) {
            setRatepayMessage(undefined);
            if (merchantReturnUrl) {
              redirectTo(merchantReturnUrl);
              return "";
            }
            onSuccess(newOrderData);
          } else {
            if (status === "COMPLETED" && payment_source) {
              if (merchantReturnUrl) {
                redirectTo(merchantReturnUrl);
                return "";
              }
              onSuccess(newOrderData);
            } else if (
              status === "PAYER_ACTION_REQUIRED" &&
              payment_source &&
              links
            ) {
              setOrderDataLinks(links);
              setOrderId(id);
            }
          }
        }
        return id;
      } catch (error) {
        if (!errorAlreadyShown) {
          notify(
            "Error",
            error instanceof Error ? error.message : t("interface.generalError")
          );
        }
        isLoading(false);
        if (forceCheckoutReportError) {
          throw error;
        }
        return "";
      }
    };

    const handleOnApprove = async (
      data: CustomOnApproveData,
      forceCheckoutReportError?: boolean
    ) => {
      const { orderID, saveCard } = data;
      isLoading(true);

      // PayPal Express only, gated by PAYPAL_REDIRECT_ON_APPROVE
      // (off by default, required on for Germany — see enabler/README.md). Calls the processor's
      // expressApprove — which adds a placeholder transaction so commercetools optimistically creates the
      // Order, then builds the redirect URL — instead of authorizing/capturing immediately here.
      // Takes priority over the legacy onApproveRedirectionUrl prop below since it needs no
      // enabler-side configuration.
      if (builderType === "express" && redirectOnApprove) {
        const expressApproveUrl = derivedUrls.expressApproveUrl;
        if (!expressApproveUrl) {
          console.error(
            '[paypal-enabler] Missing configuration for "expressApproveUrl": no processorUrl was provided.'
          );
        } else {
          const expressApproveResult = await processorRequest<
            ExpressApproveRequest,
            ExpressApproveResponse
          >(requestHeader, expressApproveUrl, {
            paymentId: paymentInfo.id,
            orderID,
            payPalIntent: settings?.payPalIntent,
          });
          if (
            expressApproveResult &&
            expressApproveResult.onApproveRedirectionUrl
          ) {
            redirectTo(expressApproveResult.onApproveRedirectionUrl);
            return;
          }
          // No merchantReturnUrl configured anywhere (session or static) — falls through to the
          // legacy prop check, then the immediate authorize/capture path below, as a last-resort
          // degrade.
        }
      }

      // Legacy prop (self-hosted merchants) — only meaningful for PayPal Express, needs
      // ?order_id= appended since it's a bare merchant-supplied prefix, not a complete URL.
      if (onApproveRedirectionUrl && builderType === "express") {
        redirectTo(`${onApproveRedirectionUrl}?order_id=${orderID}`);
        return;
      }

      const requestUrl =
        settings?.payPalIntent === "Authorize"
          ? authorizeOrderUrl
          : onApproveUrl;
      if (!requestUrl) {
        isLoading(false);
        return;
      }

      try {
        const onApproveResult = await processorRequest<
          OnApproveRequest,
          OnApproveResponse
        >(requestHeader, requestUrl, {
          paymentId: paymentInfo.id,
          paymentVersion: latestPaymentVersion,
          orderID,
          saveCard,
          builderType,
        });

        //@ts-ignore
        if (onApproveResult.ok === false) {
          throw new Error(t("payPal.generalError"));
        }
        const { orderData, merchantReturnUrl } =
          onApproveResult as OnApproveResponse;
        if (merchantReturnUrl) {
          redirectTo(merchantReturnUrl);
          return;
        }
        if (orderData.status === "COMPLETED") {
          setShowResult(true);
          setResultSuccess(true);
          purchaseCallback?.(onApproveResult);
        } else {
          setShowResult(true);
          setResultSuccess(false);
          if (orderData) {
            setResultMessage(orderData.message);
          }
          if (forceCheckoutReportError) {
            console.error(
              `[paypal-enabler] Checkout order not completed, status: ${orderData.status}`
            );
            throw new Error(t("payPal.generalError"));
          }
        }
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
        if (forceCheckoutReportError) {
          throw error;
        }
      } finally {
        isLoading(false);
      }
    };

    const handleAuthenticateThreeDSOrder = async (
      orderID: string,
      isGPay?: boolean
    ): Promise<number> => {
      if (!authenticateThreeDSOrderUrl) {
        return 0;
      }
      try {
        const result = await processorRequest<
          {
            orderID: string;
            paymentVersion?: number;
            paymentId: string;
            isGPay: boolean;
          },
          {
            version: number;
            approve: {
              liability_shift: string;
              three_d_secure: {
                enrollment_status: string;
                authentication_status: string;
              };
            };
          }
        >(requestHeader, authenticateThreeDSOrderUrl, {
          orderID,
          paymentVersion: latestPaymentVersion,
          paymentId: paymentInfo.id,
          isGPay: isGPay ?? false,
        });

        if (!result) {
          return 0;
        }

        latestPaymentVersion = result.version;

        if (!result.hasOwnProperty("approve")) {
          if (isGPay) {
            return 1;
          } else {
            return 2;
          }
        }

        const action = getActionIndex(
          result.approve.three_d_secure.enrollment_status || "",
          result.approve.three_d_secure.authentication_status || "",
          result.approve.liability_shift || ""
        );
        // Falls back to 0 ("select a different method") rather than undefined when
        // threeDSAction itself is missing — CardFieldsMask.tsx's caller does
        // `result.toString(10)`, which would throw on undefined instead of erroring gracefully.
        return settings?.threeDSAction?.[action] ?? 0;
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
        return 0;
      }
    };

    const handleUpdateShipping = async (
      request: UpdateShippingRequest
    ): Promise<UpdateShippingResponse> => {
      try {
        // Checkout-exclusive, no legacy equivalent — legacy way is to register onShippingChange
        // on the component instead.
        const requestUrl = derivedUrls.updateShippingUrl;
        if (!requestUrl) {
          console.error(
            '[paypal-enabler] Missing configuration for "updateShippingUrl": no processorUrl was provided.'
          );
          throw new Error(t("interface.generalError"));
        }

        const result = await processorRequest<
          { paymentId: string } & UpdateShippingRequest,
          UpdateShippingResponse
        >(requestHeader, requestUrl, {
          paymentId: paymentInfo.id,
          // Only relevant for an option-change call (no address) — the processor uses this
          // cached list to skip refetching delivery options for the same address.
          ...(!request.address && {
            shippingOptions: paymentInfo.shippingOptions,
          }),
          ...request,
        });

        if (!result) {
          throw new Error(t("interface.generalError"));
        }

        setPaymentInfo((prev) => ({
          ...prev,
          shippingOptions: result.shippingOptions,
        }));

        return result;
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
        throw error;
      }
    };

    // Validates a buyer's PayPal Express shipping-option pick against the freshest known
    // list before handleUpdateShipping is called — kept here (not in PayPalMask) so any
    // future component driving the same flow gets the same validation for free.
    const resolveShippingOptionId = (selectedOptionId: string): string => {
      const match = paymentInfo.shippingOptions?.find(
        (option) => option.id === selectedOptionId
      );
      if (!match) {
        throw new Error(
          `Selected shipping option ${selectedOptionId} not found`
        );
      }
      return match.id;
    };

    return {
      requestHeader,
      paymentInfo,
      clientToken,
      handleOnApprove,
      handleCreateOrder,
      vaultOnly,
      handleCreateVaultSetupToken,
      handleApproveVaultSetupToken,
      handleAuthenticateThreeDSOrder,
      handleUpdateShipping,
      resolveShippingOptionId,
      orderDataLinks,
      orderId,
      builderType,
      processorUrl,
    };
  }, [
    paymentInfo,
    createOrderUrl,
    isLoading,
    onApproveUrl,
    requestHeader,
    notify,
    settings,
    createVaultSetupTokenUrl,
    approveVaultSetupTokenUrl,
    authenticateThreeDSOrderUrl,
    builderType,
    orderDataLinks,
    orderId,
    // Constant for the provider's lifetime (set in Checkout, never in legacy mode); listed only for
    // react-hooks/exhaustive-deps
    processorUrl,
    onExpressPayButtonClick,
    onError,
  ]);

  return (
    <PaymentContext.Provider value={value}>
      {showResult ? (
        <Result success={resultSuccess} message={resultMessage} />
      ) : (
        children
      )}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
