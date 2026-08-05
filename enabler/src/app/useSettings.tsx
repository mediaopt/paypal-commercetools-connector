import React, {
  FC,
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import {
  GetSettingsResponse,
  SettingsProviderProps,
  GetUserInfoResponse,
  PaymentTokens,
} from "../types";
import { getSettings, getUserInfo, removePaymentToken } from "../services";
import { useLoader } from "./useLoader";
import { PARTNER_ATTRIBUTION_ID } from "../constants";
import { useNotifications } from "./useNotifications";

type SettingsContextT = {
  handleGetSettings: () => void;
  handleRemovePaymentToken: (paymentTokenId: string) => void;
  settings?: GetSettingsResponse;
  paymentTokens?: PaymentTokens;
};

const SettingsContext = createContext<SettingsContextT>({
  handleGetSettings: () => {},
  handleRemovePaymentToken: () => {},
  settings: undefined,
  paymentTokens: {},
});

export const SettingsProvider: FC<
  React.PropsWithChildren<SettingsProviderProps>
> = ({
  getUserInfoUrl,
  getSettingsUrl,
  requestHeader,
  options,
  children,
  removePaymentTokenUrl,
}) => {
  const [settings, setSettings] = useState<GetSettingsResponse>();
  const [userIdToken, setUserIdToken] = useState<string>();
  const [paymentTokens, setPaymentTokens] = useState<PaymentTokens>();
  const { isLoading } = useLoader();
  const { notify } = useNotifications();

  const value = useMemo(() => {
    const handleGetSettings = async () => {
      isLoading(true);

      if (getUserInfoUrl && !userIdToken) {
        const { userIdToken, paymentTokens } = (await getUserInfo(
          requestHeader,
          getUserInfoUrl
        )) as GetUserInfoResponse;

        setPaymentTokens(paymentTokens);
        setUserIdToken(userIdToken);
      }

      if (getSettingsUrl && !settings) {
        const getSettingsResult = (await getSettings(
          requestHeader,
          getSettingsUrl
        )) as Record<any, any>;

        if (
          !getSettingsResult ||
          (getSettingsResult.hasOwnProperty("ok") && !getSettingsResult.ok)
        ) {
          notify("Error", "Could not fetch settings");
          isLoading(false);
        } else {
          setSettings(getSettingsResult as GetSettingsResponse);
        }
      }
      isLoading(false);
    };
    const handleRemovePaymentToken = async (paymentTokenId: string) => {
      isLoading(true);
      if (removePaymentTokenUrl) {
        await removePaymentToken(
          requestHeader,
          removePaymentTokenUrl,
          paymentTokenId
        );

        if (paymentTokens) {
          const filterPaymentTokens = paymentTokens.payment_tokens?.filter(
            (paymentToken) => paymentToken.id !== paymentTokenId
          );
          paymentTokens.payment_tokens = filterPaymentTokens;
          setPaymentTokens({ ...paymentTokens });
        }
      }
      isLoading(false);
    };

    return {
      settings,
      handleGetSettings,
      handleRemovePaymentToken,
      paymentTokens,
    };
  }, [settings, getSettingsUrl, paymentTokens]);

  useEffect(() => {
    if (!settings) {
      value.handleGetSettings();
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {settings || !getSettingsUrl ? (
        <PayPalScriptProvider
          options={{
            ...options,
            intent: settings?.payPalIntent?.toString().toLowerCase(),
            dataUserIdToken: userIdToken,
            dataPartnerAttributionId: PARTNER_ATTRIBUTION_ID,
            merchantId: settings?.merchantId,
          }}
        >
          {children}
        </PayPalScriptProvider>
      ) : (
        <></>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
