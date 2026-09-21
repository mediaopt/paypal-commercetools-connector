import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PayPalButtons,
  PayPalMessages,
  PayPalMessagesComponentProps,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { CustomPayPalButtonsComponentProps } from "../../types";

import { usePayment } from "../../app/usePayment";
import { useSettings } from "../../app/useSettings";
import { useLoader } from "../../app/useLoader";
import { useNotifications } from "../../app/useNotifications";
import { errorFunc } from "../errorNotification";
import { useTranslation } from "react-i18next";
import { isVenmoSupported } from "../venmoAvailability";
import { PAY_LATER_MESSAGES_SUPPORTED_COUNTRIES } from "./messagesConstants";

// Wraps a PayPal Express shipping callback so a thrown/rejected error also calls the
// SDK's own actions.reject()
const rejectOnError =
  (fn: (data: any, actions: any) => Promise<any> | any) =>
  async (data: any, actions: any) => {
    try {
      return await fn(data, actions);
    } catch (error) {
      actions.reject();
      throw error;
    }
  };

export const PayPalMask: React.FC<CustomPayPalButtonsComponentProps> = (
  props
) => {
  const {
    handleCreateOrder,
    handleOnApprove,
    vaultOnly,
    handleCreateVaultSetupToken,
    handleApproveVaultSetupToken,
    builderType,
    handleUpdateShipping,
    resolveShippingOptionId,
    paymentInfo,
  } = usePayment();
  const { settings, paymentTokens } = useSettings();
  const isExpress = builderType === "express";
  const { isLoading } = useLoader();
  const { notify } = useNotifications();
  const { t } = useTranslation();
  const {
    enableVaulting,
    paypalMessages,
    messagesStyle,
    disablePayLaterButton,
    ...restprops
  } = props;
  const save = useRef<HTMLInputElement>(null);
  const [{ isResolved }] = usePayPalScriptReducer();

  const storeInVaultOnSuccess = settings?.storeInVaultOnSuccess;
  const logTag = restprops.fundingSource ?? "PayPal";

  // by PayPal requirement unless requested by merchant PayLater should be placed together with PayPal pay button
  const payLaterButtonAllowed =
    restprops.fundingSource === "paypal" &&
    !vaultOnly &&
    !isExpress &&
    settings?.acceptPayLater !== false &&
    disablePayLaterButton !== true;

  // Traceable script-resolution visibility for this specific button
  useEffect(() => {
    if (!isResolved) {
      return;
    }
    if (!window.paypal?.Buttons) {
      console.error(
        `[paypal-enabler][${logTag}] script resolved but window.paypal.Buttons is missing — the button will not render`
      );
    }
  }, [isResolved]);

  const [isFundingSourceEligible, setIsFundingSourceEligible] = useState(true);

  // Silent-render safety net: a funding-source-restricted button (Sepa/PayLater/PayPalCreditCard/
  // Venmo) renders nothing at all when PayPal's own SDK decides the buyer/cart isn't eligible for
  // it (e.g. Venmo for a EUR cart) — notification is not an option for checkout - as it loads all methods and show error regardless if venmo is selected.
  useEffect(() => {
    if (!isResolved || !restprops.fundingSource || !window.paypal?.Buttons) {
      return;
    }
    const paypalEligible = window.paypal
      .Buttons({ fundingSource: restprops.fundingSource })
      .isEligible();
    if (!paypalEligible) {
      console.warn(`"${restprops.fundingSource}" not eligible`);
    }
    const isEligible =
      paypalEligible &&
      (restprops.fundingSource !== "venmo" || isVenmoSupported());
    setIsFundingSourceEligible(isEligible);
    if (!isEligible) {
      console.log(
        `[paypal-enabler][${logTag}] funding source not eligible, rendering not-eligible notice instead of an error`
      );
    }
  }, [isResolved, restprops.fundingSource]);

  const [isPayLaterEligible, setIsPayLaterEligible] = useState(true);

  // isFundingSourceEligible above, but for the extra "paylater" button specifically
  useEffect(() => {
    if (!isResolved || !payLaterButtonAllowed || !window.paypal?.Buttons) {
      return;
    }
    const eligible = window.paypal
      .Buttons({ fundingSource: "paylater" })
      .isEligible();
    setIsPayLaterEligible(eligible);
    if (!eligible) {
      console.log(
        `[paypal-enabler][${logTag}] "paylater" not eligible, skipping the extra PayLater button`
      );
    }
  }, [isResolved, payLaterButtonAllowed]);

  const showPayLaterButton = payLaterButtonAllowed && isPayLaterEligible;

  const hasPaypalToken = useMemo(() => {
    if (paymentTokens?.payment_tokens) {
      return paymentTokens.payment_tokens.some(
        (token) => token.payment_source.paypal
      );
    }
    return false;
  }, [paymentTokens]);

  const style = useMemo(() => {
    if (restprops.style || !settings) {
      return restprops.style;
    }
    let styles: Record<string, string | boolean> = {};
    if (settings.paypalButtonConfig) {
      styles.label = settings.paypalButtonConfig.buttonLabel;
      // Only apply the merchant's configured brand color to PayPal's own funding sources — a
      // fixed color could clash with another funding source's own branding (e.g. Venmo blue).
      if (
        !restprops.fundingSource ||
        (restprops.fundingSource &&
          ["paypal", "paylater"].includes(restprops.fundingSource))
      ) {
        styles.color = settings.paypalButtonConfig.buttonColor;
      }
    }
    if (settings.buttonShape) {
      styles.shape = settings.buttonShape;
    }

    return styles;
  }, [settings, restprops]);

  // In legacy mode it is merchant responsibility to provide messages content,
  // in checkout they are calculated based on cart
  // if cart currency and PayPal merchant account currency don't match -
  // messages will not be shown by PayPal automatically
  const resolvedPaypalMessages = useMemo<
    PayPalMessagesComponentProps | undefined
  >(() => {
    if (paypalMessages) {
      return paypalMessages;
    }
    if (
      restprops.fundingSource !== "paypal" ||
      !paymentInfo.countryCode ||
      !PAY_LATER_MESSAGES_SUPPORTED_COUNTRIES.has(paymentInfo.countryCode)
    ) {
      return undefined;
    }
    if (vaultOnly) {
      return undefined;
    } //kept for consistency if vaultOnly will ever be allowed in checkout
    const { centAmount, currencyCode, fractionDigits } =
      paymentInfo.amountPlanned;
    return {
      ...(messagesStyle && { style: messagesStyle }),
      amount: (centAmount / 10 ** fractionDigits).toFixed(fractionDigits),
      currency: currencyCode as PayPalMessagesComponentProps["currency"],
      placement: isExpress ? "product" : "payment",
    };
  }, [
    paypalMessages,
    restprops.fundingSource,
    paymentInfo,
    vaultOnly,
    isExpress,
    messagesStyle,
  ]);

  let actions: any;

  if (vaultOnly) {
    actions = {
      createVaultSetupToken: () => handleCreateVaultSetupToken("paypal"),
      onApprove: handleApproveVaultSetupToken,
    };
  } else {
    actions = {
      createOrder: () => {
        return handleCreateOrder({
          storeInVault: save.current?.checked,
          paymentSource: "paypal",
        });
      },
      onApprove: handleOnApprove,
    };

    //handleUpdateShipping keeps paymentInfo.shippingOptions in sync with each response,
    // so onShippingOptionsChange always resolves the buyer's pick against up-to-date data.
    if (isExpress) {
      actions.onShippingAddressChange = rejectOnError((data: any) =>
        handleUpdateShipping({
          orderID: data.orderID,
          address: data.shippingAddress,
        })
      );

      actions.onShippingOptionsChange = rejectOnError((data: any) => {
        if (!data.selectedShippingOption) {
          throw new Error("Missing shipping option information");
        }
        return handleUpdateShipping({
          orderID: data.orderID,
          shippingMethodId: resolveShippingOptionId(
            data.selectedShippingOption.id
          ),
        });
      });
    }
  }

  return (
    <>
      <PayPalButtons
        {...restprops}
        style={style}
        {...actions}
        onError={(err) => errorFunc(err, isLoading, notify, t)}
      />
      {showPayLaterButton && (
        <PayPalButtons
          {...restprops}
          fundingSource="paylater"
          style={style}
          {...actions}
          onError={(err) => errorFunc(err, isLoading, notify, t)}
        />
      )}
      {!vaultOnly &&
        builderType !== "express" &&
        !hasPaypalToken &&
        (enableVaulting || storeInVaultOnSuccess) && (
          <label>
            <input
              type="checkbox"
              id="save"
              name="save"
              ref={save}
              className="mr-1"
            />
            Save for future purchases
          </label>
        )}

      {resolvedPaypalMessages && <PayPalMessages {...resolvedPaypalMessages} />}

      {restprops.fundingSource && !isFundingSourceEligible && (
        <div>{t("payPal.notEligible")}</div>
      )}
    </>
  );
};
