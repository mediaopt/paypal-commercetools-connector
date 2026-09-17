import { useEffect, useRef, useState, FC } from "react";

import { usePayment } from "../../app/usePayment";
import loadScript from "../../app/loadScript";
import { ERROR_TEXT_STYLE } from "../../styles";
import { CustomPayPalButtonsComponentProps, GooglePayOptionsType } from "../../types";

declare const google: any;
declare const paypal: any;

const GOOGLE_PAY_SCRIPT_URL = "https://pay.google.com/gp/p/js/pay.js";

type GooglePayMaskComponentProps = GooglePayOptionsType &
  CustomPayPalButtonsComponentProps;

export const GooglePayMask: FC<GooglePayMaskComponentProps> = ({
  apiVersion = 2,
  apiVersionMinor = 0,
  allowedCardNetworks,
  allowedCardAuthMethods,
  callbackIntents,
  environment = "TEST",
  totalPriceStatus = "FINAL",
  buttonColor = "black",
  buttonType = "buy",
  buttonRadius,
  buttonSizeMode = "static",
  verificationMethod,
}) => {
  const [error, setError] = useState<string>();
  const [paymentsClient, setPaymentsClient] = useState<any>();
  const buttonCreated = useRef(false);
  const googlePayButton = useRef<HTMLDivElement>(null);

  const { paymentInfo, handleCreateOrder } = usePayment();

  const isProduction = environment === "PRODUCTION";
  const baseRequest = { apiVersion, apiVersionMinor };
  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks,
    },
  };

  // Google Pay requires total.amount as a decimal string (e.g. "12.00"), not commercetools' integer
  // minor-unit centAmount — same conversion ApplePayMask.tsx already does for its own total.
  const getGoogleTransactionInfo = () => {
    const { centAmount, currencyCode, fractionDigits } =
      paymentInfo.amountPlanned;
    return {
      currencyCode,
      totalPriceStatus,
      totalPrice: (centAmount / 10 ** fractionDigits).toFixed(fractionDigits),
    };
  };

  const processPayment = async (paymentData: any) => {
    try {
      const { currencyCode, totalPrice } = getGoogleTransactionInfo();
      await handleCreateOrder({
        paymentSource: "google_pay",
        verificationMethod,
        googlePayData: {
          purchase_units: [
            { amount: { currency_code: currencyCode, value: totalPrice } },
          ],
          paymentData,
        },
      });
      return { transactionState: "SUCCESS" };
    } catch (err) {
      console.error("GooglePay: error processing payment", err);
      setError("Error in payment authorization");
      return {
        transactionState: "ERROR",
        error: {
          intent: "PAYMENT_AUTHORIZATION",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  };

  // Shape Google's Payment API expects back from its own onPaymentAuthorized callback.
  const onPaymentAuthorized = (paymentData: any) =>
    new Promise((resolve) => {
      processPayment(paymentData).then(resolve);
    });

  const getGooglePaymentDataRequest = async () => {
    // Server-driven Google Pay config from PayPal — allowedPaymentMethods/merchantInfo, same bridge
    // usePayment.tsx's handleCreateOrder already calls Googlepay() on for confirmOrder.
    // @ts-ignore
    const { allowedPaymentMethods, merchantInfo } = await paypal
      .Googlepay()
      .config();

    return {
      ...baseRequest,
      allowedPaymentMethods,
      merchantInfo,
      transactionInfo: getGoogleTransactionInfo(),
      ...(isProduction ? { callbackIntents } : {}),
    };
  };

  const onGooglePayButtonClicked = async () => {
    try {
      const paymentDataRequest = await getGooglePaymentDataRequest();
      if (isProduction) {
        // Production requires the paymentDataCallbacks.onPaymentAuthorized callback registered on
        // the client at construction time — Google resolves the payment sheet through that
        // callback itself, so nothing further is needed here.
        await paymentsClient.loadPaymentData(paymentDataRequest);
      } else {
        const paymentData = await paymentsClient.loadPaymentData(
          paymentDataRequest
        );
        await onPaymentAuthorized(paymentData);
      }
    } catch (err) {
      console.error("GooglePay: button click failed", err);
      setError("Error in payment authorization");
    }
  };

  const addGooglePayButton = () => {
    if (buttonCreated.current || !paymentsClient || !googlePayButton.current) {
      return;
    }
    buttonCreated.current = true;

    const button = paymentsClient.createButton({
      onClick: onGooglePayButtonClicked,
      allowedPaymentMethods: [baseCardPaymentMethod],
      buttonColor,
      buttonType,
      buttonSizeMode,
      ...(buttonRadius !== undefined ? { buttonRadius } : {}),
    });

    googlePayButton.current.appendChild(button);
  };

  const onGooglePayLoaded = () => {
    const isReadyToPayRequest = {
      ...baseRequest,
      allowedPaymentMethods: [baseCardPaymentMethod],
    };

    paymentsClient
      .isReadyToPay(isReadyToPayRequest)
      .then((response: any) => {
        if (response.result) {
          addGooglePayButton();
        }
      })
      .catch((err: any) => {
        console.warn("GooglePay: not ready to pay", err);
        setError("Google Pay is not available.");
      });
  };

  useEffect(() => {
    loadScript(GOOGLE_PAY_SCRIPT_URL).then(() => {
      try {
        const client = new google.payments.api.PaymentsClient({
          environment,
          ...(isProduction
            ? { paymentDataCallbacks: { onPaymentAuthorized } }
            : {}),
        });
        setPaymentsClient(client);
      } catch (err) {
        console.warn("GooglePay: failed to create PaymentsClient", err);
        setError("Error while fetching Google Pay configuration.");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paymentsClient) {
      onGooglePayLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentsClient]);

  return (
    <div id="googlepay-container">
      <div ref={googlePayButton}></div>
      {error && <div className={ERROR_TEXT_STYLE}>{error}</div>}
    </div>
  );
};
