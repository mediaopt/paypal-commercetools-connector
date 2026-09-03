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
import { Result } from "../components/Result";
import {
  GeneralComponentsProps,
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

type PaymentContextT = {
  paymentInfo: PaymentInfo;
  requestHeader: RequestHeader;
  clientToken: string;
  handleCreateOrder: (orderData?: CustomOrderData) => Promise<string>;
  handleOnApprove: (data: CustomOnApproveData) => Promise<void>;
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
  React.PropsWithChildren<GeneralComponentsProps>
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
  requestHeader,
  shippingMethodId,
  cartInformation,

  enableVaulting,
  paymentMethodType,
  builderType,
  processorUrl,
  redirectOnApprove,
}) => {
  const [clientToken, setClientToken] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState<boolean>();
  const [resultMessage, setResultMessage] = useState<string>();
  const [orderDataLinks, setOrderDataLinks] = useState<OrderDataLinks>();
  const [orderId, setOrderId] = useState<string>();

  const { settings } = useSettings();

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(
    PaymentInfoInitialObject
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

  useEffect(() => {
    if (vaultOnly) return;

    const initPayment = async () => {
      isLoading(true);
      try {
        const createPaymentResult = await processorRequest<
          {},
          CreatePaymentResponse
        >(requestHeader, createPaymentUrl, {
          ...cartInformation,
          shippingMethodId: shippingMethodId,
          paymentMethodType,
          builderType,
        });

        if (!createPaymentResult) {
          throw new Error(t("payPal.generalError"));
        }

        let paymentVersion: number | undefined = createPaymentResult.version;
        if (getClientTokenUrl) {
          const clientTokenResult = (await processorRequest<
            ClientTokenRequest,
            ClientTokenResponse
          >(requestHeader, getClientTokenUrl, {
            paymentId: createPaymentResult.id,
            paymentVersion: createPaymentResult.version,
            braintreeCustomerId: createPaymentResult.braintreeCustomerId,
            merchantAccountId: undefined,
          })) as ClientTokenResponse;
          setClientToken(clientTokenResult.clientToken);
          paymentVersion = clientTokenResult.paymentVersion;
        }

        setPaymentInfo({
          id: createPaymentResult.id,
          amountPlanned: createPaymentResult.amountPlanned,
          lineItems: createPaymentResult.lineItems,
          email: createPaymentResult.email,
          firstName: createPaymentResult.firstName,
          lastName: createPaymentResult.lastName,
          countryCode: createPaymentResult.countryCode,
          shippingAddress: createPaymentResult.shippingAddress,
          shippingOptions: createPaymentResult.shippingOptions,
          priceBreakdown: createPaymentResult.priceBreakdown,
          ctCustomerId: createPaymentResult.ctCustomerId,
          customerVersion: createPaymentResult.customerVersion,
          version: paymentVersion,
          cartInformation: cartInformation,
        });
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

    const handleCreateOrder = async (orderData?: CustomOrderData) => {
      if (!createOrderUrl) return "";
      const setRatepayMessage = orderData?.setRatepayMessage ?? undefined;
      try {
        const relevantOrderData = setRelevantData(
          orderData,
          !!setRatepayMessage,
          enableVaulting
        );

        const createOrderResult = await processorRequest<
          CreateOrderRequest,
          CreateOrderResponse
        >(requestHeader, createOrderUrl, {
          paymentId: paymentInfo.id,
          paymentVersion: latestPaymentVersion,
          payPalIntent: settings?.payPalIntent,
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

        const { orderData: newOrderData, paymentVersion } = createOrderResult;
        const { id, status, payment_source, details, links, message } =
          newOrderData;
        latestPaymentVersion = paymentVersion;

        if (!id) {
          handleResponseError(
            t,
            notify,
            details?.toString(),
            message,
            setRatepayMessage
          );
          isLoading(false);
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
            handleOnApprove({ orderID: newOrderData.id }).then(() =>
              onSuccess(newOrderData)
            );
          } else if (
            oldOrderData?.googlePayData &&
            status === "PAYER_ACTION_REQUIRED"
          ) {
            return "";
            /*
            //@ts-ignore
            paypal
              .Googlepay()
              .initiatePayerAction({ orderId: orderData.id })
              .then(async () => {
                handleAuthenticateThreeDSOrder(orderData.id, true).then(
                  (result) => {
                    if (!result) {
                      notify("Error", "Please select different payment method");
                      isLoading(false);
                      return "";
                    }
                    switch (result.toString(10)) {
                      case "2":
                        handleOnApprove({ orderID: orderData.id }).then(() =>
                          onSuccess(orderData)
                        );
                        break;
                      case "1":
                        notify("Warning", "Try again");
                        isLoading(false);
                        break;
                      case "0":
                      default:
                        notify(
                          "Error",
                          "Please select different payment method"
                        );
                        isLoading(false);
                        break;
                    }
                  }
                );
              });*/
          } else {
            return "";
          }
        } else {
          if (setRatepayMessage) {
            setRatepayMessage && setRatepayMessage(undefined);
            onSuccess(newOrderData);
          } else {
            if (status === "COMPLETED" && payment_source) {
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
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
        isLoading(false);
        return "";
      }
    };

    const handleOnApprove = async (data: CustomOnApproveData) => {
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
        settings?.payPalIntent === "Authorize" ? authorizeOrderUrl : onApproveUrl;
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
        }
      } catch (error) {
        notify(
          "Error",
          error instanceof Error ? error.message : t("interface.generalError")
        );
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
    processorUrl,
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
