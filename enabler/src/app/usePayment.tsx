import React, {
  FC,
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import type { FUNDING_SOURCE } from "@paypal/paypal-js/types/components/funding-eligibility";

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
} from "../types";
import { processorRequest } from "../services/processorRequest";
import { processorUrls } from "../components/constants";
import { resolveEndpointUrl } from "../helpers/resolveEndpointUrl";

import { useLoader } from "./useLoader";
import { useNotifications } from "./useNotifications";
import { useSettings } from "./useSettings";
// import { getActionIndex } from "../components/CardFields/constants"; todo - restore all commented out code when enabling other payment methods
import { useTranslation } from "react-i18next";
import { handleResponseError } from "../messages/errorMessages";

const PaymentInfoInitialObject = {
  version: 0,
  id: "",
  amount: 0,
  currency: "",
  lineItems: [],
  shippingMethod: {},
  cartInformation: CartInformationInitial,
  sessionKey: "",
  sessionValue: "",
};

type PaymentContextT = {
  setSuccess: () => void;
  paymentInfo: PaymentInfo;
  requestHeader: RequestHeader;
  handleCreatePayment: () => Promise<void>;
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
  // handleAuthenticateThreeDSOrder: (orderID: string) => Promise<number>;
  orderId?: string;
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
  setSuccess: () => {},
  paymentInfo: PaymentInfoInitialObject,
  requestHeader: {},
  handleCreatePayment: () => Promise.resolve(),
  clientToken: "",
  handleCreateOrder: (orderData?: CustomOrderData) => Promise.resolve(""),
  handleOnApprove: () => Promise.resolve(),
  vaultOnly: false,
  handleCreateVaultSetupToken: (paymentSource: FUNDING_SOURCE) =>
    Promise.resolve(""),
  handleApproveVaultSetupToken: (data?: ApproveVaultSetupTokenData) =>
    Promise.resolve(),
  // handleAuthenticateThreeDSOrder: (orderID: string) => Promise.resolve(0),
  orderDataLinks: undefined,
  orderId: undefined,
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
    purchaseCallback(orderData);
  };

  let latestPaymentVersion = paymentInfo.version;

  useEffect(() => {
    if (showResult) {
      isLoading(false);
    }
  }, [showResult]);

  const value = useMemo(() => {
    const derivedUrls: Partial<ReturnType<typeof processorUrls>> = processorUrl
      ? processorUrls(processorUrl)
      : {};

    const setSuccess = () => {
      setResultSuccess(true);
      setShowResult(true);
      setResultMessage("Test success successful");
    };

    const handleCreateVaultSetupToken = async (
      paymentSource: FUNDING_SOURCE
    ) => {
      let requestUrl: string;
      try {
        requestUrl = resolveEndpointUrl(
          undefined,
          createVaultSetupTokenUrl,
          "createVaultSetupTokenUrl"
        );
      } catch {
        notify("Error", "something went wrong");
        return "";
      }

      const createVaultSetupTokenResult = await processorRequest<
        CreateVaultSetupTokenRequest,
        CreateVaultSetupTokenResponse
      >(requestHeader, requestUrl, { paymentSource });

      return createVaultSetupTokenResult
        ? createVaultSetupTokenResult.createVaultSetupTokenResponse.id
        : "";
    };
    const handleApproveVaultSetupToken = async ({
      vaultSetupToken,
    }: ApproveVaultSetupTokenData) => {
      let requestUrl: string;
      try {
        requestUrl = resolveEndpointUrl(
          undefined,
          approveVaultSetupTokenUrl,
          "approveVaultSetupTokenUrl"
        );
      } catch {
        notify("Error", "something went wrong");
        return;
      }

      const result = await processorRequest<
        ApproveVaultSetupTokenRequest,
        ApproveVaultSetupTokenResponse
      >(requestHeader, requestUrl, { vaultSetupToken });
      if (result) {
        setShowResult(true);
        setResultSuccess(true);
        purchaseCallback(result);
      } else {
        setShowResult(true);
        setResultSuccess(false);
      }
    };

    const handleCreateOrder = async (orderData?: CustomOrderData) => {
      let createOrderRequestUrl: string;
      try {
        createOrderRequestUrl = resolveEndpointUrl(
          derivedUrls.createOrderUrl,
          createOrderUrl,
          "createOrderUrl"
        );
      } catch {
        notify("Error", "something went wrong");
        isLoading(false);
        return "";
      }

      const setRatepayMessage = orderData?.setRatepayMessage ?? undefined;
      const relevantOrderData = setRelevantData(
        orderData,
        !!setRatepayMessage,
        enableVaulting
      );

      const createOrderResult = await processorRequest<
        CreateOrderRequest,
        CreateOrderResponse
      >(requestHeader, createOrderRequestUrl, {
        paymentId: paymentInfo.id,
        paymentVersion: latestPaymentVersion,
        orderData: {
          ...relevantOrderData,
        },
      });

      if (
        !createOrderResult ||
        (createOrderResult && createOrderResult.ok === false)
      ) {
        notify("Error", "something went wrong");
        isLoading(false);
        return "";
      }

      const oldOrderData = orderData;

      if (createOrderResult) {
        const { orderData, paymentVersion } = createOrderResult;
        const { id, status, payment_source, details, links, message } =
          orderData;
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
            orderId: orderData.id,
            paymentMethodData:
              oldOrderData.googlePayData.paymentData.paymentMethodData,
          });
          const { status } = confirmOrderResult;
          if (status === "APPROVED") {
            handleOnApprove({ orderID: orderData.id }).then(() =>
              onSuccess(orderData)
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
            onSuccess(orderData);
          } else {
            if (status === "COMPLETED" && payment_source) {
              onSuccess(orderData);
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
      } else return "";
    };

    const handleOnApprove = async (data: CustomOnApproveData) => {
      const { orderID, saveCard } = data;
      isLoading(true);

      if (onApproveRedirectionUrl) {
        window.location.href = `${onApproveRedirectionUrl}?order_id=${orderID}`;
        return;
      }

      let requestUrl: string;
      try {
        requestUrl =
          settings?.payPalIntent === "Authorize"
            ? resolveEndpointUrl(
                derivedUrls.authorizeOrderUrl,
                authorizeOrderUrl,
                "authorizeOrderUrl"
              )
            : resolveEndpointUrl(
                derivedUrls.onApproveUrl,
                onApproveUrl,
                "onApproveUrl"
              );
      } catch {
        isLoading(false);
        notify("Error", "something went wrong");
        return;
      }

      const onApproveResult = await processorRequest<
        OnApproveRequest,
        OnApproveResponse
      >(requestHeader, requestUrl, {
        paymentId: paymentInfo.id,
        paymentVersion: latestPaymentVersion,
        orderID,
        saveCard,
      });

      //@ts-ignore
      if (onApproveResult.ok === false) {
        isLoading(false);
        notify("Error", "There was an error completing the payment");
        return;
      }
      const { orderData } = onApproveResult as OnApproveResponse;
      if (orderData.status === "COMPLETED") {
        setShowResult(true);
        setResultSuccess(true);
        purchaseCallback(onApproveResult);
      } else {
        setShowResult(true);
        setResultSuccess(false);
        if (orderData) {
          setResultMessage(orderData.message);
        }
      }
      isLoading(false);
    };

    const handleCreatePayment = async () => {
      isLoading(true);

      let createPaymentRequestUrl: string;
      try {
        createPaymentRequestUrl = resolveEndpointUrl(
          derivedUrls.createPaymentUrl,
          createPaymentUrl,
          "createPaymentUrl"
        );
      } catch {
        isLoading(false);
        notify("Error", "something went wrong");
        return;
      }

      const createPaymentResult = await processorRequest<
        {},
        CreatePaymentResponse
      >(requestHeader, createPaymentRequestUrl, {
        ...cartInformation,
        shippingMethodId: shippingMethodId,
        paymentMethodType,
        builderType,
      });

      if (!createPaymentResult) {
        isLoading(false);
        notify("Error", "There is an error in creating payment!");
        return;
      }

      let paymentVersion: number = createPaymentResult.version;
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

      const { amountPlanned, lineItems, shippingMethod } = createPaymentResult;

      setPaymentInfo({
        id: createPaymentResult.id,
        version: paymentVersion,
        amount: amountPlanned.centAmount / 100,
        currency: amountPlanned.currencyCode,
        lineItems: lineItems,
        shippingMethod: shippingMethod,
        cartInformation: cartInformation,
      });
      isLoading(false);
    };

    let vaultOnly: boolean = !!(
      createVaultSetupTokenUrl && approveVaultSetupTokenUrl
    );

    // const handleAuthenticateThreeDSOrder = async (
    //   orderID: string,
    //   isGPay?: boolean
    // ): Promise<number> => {
    //   if (!authenticateThreeDSOrderUrl) {
    //     return 0;
    //   }
    //   const result = await processorRequest<
    //     Record<string, string | number | boolean>,
    //     {
    //       version: number;
    //       approve: {
    //         liability_shift: string;
    //         three_d_secure: {
    //           enrollment_status: string;
    //           authentication_status: string;
    //         };
    //       };
    //     }
    //   >(requestHeader, authenticateThreeDSOrderUrl, {
    //     orderID,
    //     paymentVersion: latestPaymentVersion,
    //     paymentId: paymentInfo.id,
    //     isGPay: isGPay ?? false,
    //   });
    //
    //   if (!result) {
    //     return 0;
    //   }
    //
    //   latestPaymentVersion = result.version;
    //
    //   if (!result.hasOwnProperty("approve")) {
    //     if (isGPay) {
    //       return 1;
    //     } else {
    //       return 2;
    //     }
    //   }
    //
    //   const action = getActionIndex(
    //     result.approve.three_d_secure.enrollment_status || "",
    //     result.approve.three_d_secure.authentication_status || "",
    //     result.approve.liability_shift || ""
    //   );
    //   return settings?.threeDSAction[action];
    // };

    return {
      setSuccess,
      requestHeader,
      paymentInfo,
      handleCreatePayment,
      clientToken,
      handleOnApprove,
      handleCreateOrder,
      vaultOnly,
      handleCreateVaultSetupToken,
      handleApproveVaultSetupToken,
      // handleAuthenticateThreeDSOrder,
      orderDataLinks,
      orderId,
    };
  }, [
    paymentInfo,
    cartInformation,
    createOrderUrl,
    createPaymentUrl,
    isLoading,
    onApproveUrl,
    requestHeader,
    shippingMethodId,
    notify,
    settings,
    createVaultSetupTokenUrl,
    approveVaultSetupTokenUrl,
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
