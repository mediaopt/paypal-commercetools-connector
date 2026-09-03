import { useEffect, useState, useMemo, FC } from "react";

import { useSettings } from "../../app/useSettings";
import loadScript from "../../app/loadScript";
import { usePayment } from "../../app/usePayment";
import { ERROR_TEXT_STYLE } from "../../styles";
import { useLoader } from "../../app/useLoader";
import {
  CustomPayPalButtonsComponentProps,
  ApplePayProps,
  ApplepayConfig,
  ApplePaySession,
  Applepay,
} from "../../types";
import { BUTTON, CARD_FIELDS, DEVICE_ERROR } from "./constants";
import { isApplePaySupported } from "../applePayAvailability";

declare const window: any;
declare const paypal: any;

type ApplePayMaskComponentProps = ApplePayProps &
  CustomPayPalButtonsComponentProps;

export const ApplePayMask: FC<ApplePayMaskComponentProps> = (props) => {
  const [error, setError] = useState<string>();
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [payConfig, setPayConfig] = useState<ApplepayConfig>();
  const [pay, setPay] = useState<Applepay>();
  const [vaultId, setVaultId] = useState<string>();
  const [addNew, setAddNew] = useState(false);

  const { settings, paymentTokens } = useSettings();
  const { paymentInfo, handleCreateOrder, handleOnApprove } = usePayment();
  const { isLoading } = useLoader();

  const applepayPaymentTokens = paymentTokens?.payment_tokens?.filter(
    (paymentToken) => paymentToken.payment_source.apple_pay !== undefined
  );

  const { applePayDisplayName } = props;

  const hostedFieldClasses = useMemo(() => {
    const hostedFieldsPayButtonClasses =
      settings?.hostedFieldsPayButtonClasses || BUTTON;
    const hostedFieldsInputFieldClasses =
      settings?.hostedFieldsInputFieldClasses || CARD_FIELDS;
    return { hostedFieldsPayButtonClasses, hostedFieldsInputFieldClasses };
  }, [settings]);

  useEffect(() => {
    loadScript("https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js").then(
      async () => {
        // Reuses the same device/browser-capability check PayPalBuilder.ts's isAvailable()
        // already consulted before this component was even mounted — see applePayAvailability.ts.
        if (!isApplePaySupported()) {
          setError(DEVICE_ERROR);
          return;
        }
        try {
          const applepay: Applepay = await paypal.Applepay();
          const applepayConfig: ApplepayConfig = await applepay.config();
          if (applepayConfig.isEligible) {
            setIsEligible(true);
            setPayConfig(applepayConfig);
            setPay(applepay);
          }
        } catch (error) {
          setError("Error while fetching Apple Pay configuration.");
          return;
        }
      }
    );
  }, [props]);

  const onApplePayButtonClicked = () => {
    const applePaySession: ApplePaySession = window.ApplePaySession;
    if (!applePaySession || !payConfig || !paymentInfo || !pay) {
      setError("Apple Pay session, config, pay or payment info not available");
      return;
    }

    // Apple Pay requires total.amount as a decimal string (e.g. "12.00"), not commercetools'
    // integer minor-unit centAmount.
    const { centAmount, currencyCode, fractionDigits } =
      paymentInfo.amountPlanned;
    const amount = (centAmount / 10 ** fractionDigits).toFixed(fractionDigits);

    const paymentRequest = {
      countryCode: payConfig.countryCode,
      merchantCapabilities: payConfig.merchantCapabilities,
      supportedNetworks: payConfig.supportedNetworks,
      currencyCode,
      requiredBillingContactFields: ["postalAddress"],
      total: {
        label: applePayDisplayName,
        type: "final",
        amount,
      },
    };
    const session = new applePaySession(4, paymentRequest);

    session.onvalidatemerchant = async (event: any) => {
      try {
        const validateResult = await pay.validateMerchant({
          validationUrl: event.validationURL,
          displayName: applePayDisplayName,
        });

        session.completeMerchantValidation(validateResult.merchantSession);
      } catch (validateError) {
        console.error("Error validating merchant", validateError);
        setError("Error validating merchant");

        session.abort();
      }
    };

    session.onpaymentauthorized = async (event: any) => {
      try {
        const orderId = await handleCreateOrder({
          paymentSource: "apple_pay",
        });

        await pay.confirmOrder({
          orderId: orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
        });

        await handleOnApprove({ orderID: orderId });

        session.completePayment(applePaySession.STATUS_SUCCESS);
      } catch (error) {
        console.error("error", error);
        setError("Error in payment authorization");
        session.completePayment(applePaySession.STATUS_FAILURE);
      }
    };

    session.begin();
  };

  return (
    <>
      {/* Vaulted-card UI is legacy/self-hosted-only — no guard needed here: applepayPaymentTokens
      can only be non-empty if useSettings.tsx's paymentTokens was populated, which only happens
      via getUserInfoUrl (see useSettings.tsx's handleGetSettings). getUserInfoUrl is a
      LegacyVaultProps-only field — RenderTemplate.tsx/processorUrls() never set it in Checkout
      mode, and SettingsProvider has no initialPaymentTokens-style seed for it either — so
      paymentTokens, and therefore this branch, is always empty under Checkout regardless. */}
      {applepayPaymentTokens &&
      applepayPaymentTokens.length > 0 &&
      addNew === false ? (
        <>
          {applepayPaymentTokens.map((paymentToken) => {
            const { id, payment_source } = paymentToken;
            const { brand, last_digits } = payment_source.apple_pay.card;

            return (
              <div key={id}>
                <span>
                  <input
                    type="radio"
                    name="pay-with-vaulted-card"
                    value={id}
                    onChange={(e) => {
                      setVaultId(e.target.value);
                    }}
                  />
                  {brand} ending in {last_digits}
                </span>
              </div>
            );
          })}
          {vaultId && (
            <div>
              <div className="h-9">
                <button
                  className={`${hostedFieldClasses.hostedFieldsPayButtonClasses} float-left`}
                  onClick={async () => {
                    isLoading(true);
                    await handleCreateOrder({
                      paymentSource: "apple_pay",
                      vaultId: vaultId,
                    });
                    isLoading(false);
                  }}
                >
                  Pay
                </button>
              </div>
            </div>
          )}

          <button onClick={() => setAddNew(true)}>Add A New Card</button>
        </>
      ) : (
        <div id="applepay-container">
          {isEligible && (
            <>
              <button
                onClick={onApplePayButtonClicked}
                type="button"
                className="w-full justify-center text-white bg-primary-900 focus:ring-4 focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 mr-2 mb-2"
              >
                Check out with Apple Pay
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="apple"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="currentColor"
                    d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                  ></path>
                </svg>
              </button>
            </>
          )}

          {error && <div className={ERROR_TEXT_STYLE}>{error}</div>}
        </div>
      )}
    </>
  );
};
