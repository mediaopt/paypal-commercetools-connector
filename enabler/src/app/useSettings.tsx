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
  RemovePaymentTokenRequest,
} from "../types";
import { processorRequest } from "../services/processorRequest";
import { storedPaymentMethodUrl } from "../components/constants";
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
  processorUrl,
  initialSettings,
  initialUserIdToken,
  isStoredCheckoutComponent,
}) => {
  // Seeds from the processor's /operations/config response when available (Checkout mode) — in
  // that mode getSettingsUrl/getUserInfoUrl are never set, so handleGetSettings below would
  // otherwise never populate these at all.
  const [settings, setSettings] = useState<GetSettingsResponse | undefined>(
    initialSettings
  );
  const [userIdToken, setUserIdToken] = useState<string | undefined>(
    initialUserIdToken
  );
  const [paymentTokens, setPaymentTokens] = useState<PaymentTokens>();
  const { isLoading } = useLoader();
  const { notify } = useNotifications();

  const value = useMemo(() => {
    const handleGetSettings = async () => {
      isLoading(true);

      if (getUserInfoUrl && !userIdToken) {
        const { userIdToken, paymentTokens } = (await processorRequest<
          undefined,
          GetUserInfoResponse
        >(
          requestHeader,
          getUserInfoUrl,
          undefined,
          "GET"
        )) as GetUserInfoResponse;

        setPaymentTokens(paymentTokens);
        setUserIdToken(userIdToken);
      }

      if (getSettingsUrl && !settings) {
        const getSettingsResult = (await processorRequest<
          undefined,
          GetSettingsResponse
        >(requestHeader, getSettingsUrl, undefined, "GET")) as Record<any, any>;

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
      // Prefers the processor-derived DELETE route over the legacy removePaymentTokenUrl (POST +
      // body) — this route needs a path param processorUrls()'s flat-string map doesn't support,
      // hence the dedicated storedPaymentMethodUrl() helper alongside it.
      let didRequest = false;
      if (processorUrl) {
        await processorRequest(
          requestHeader,
          storedPaymentMethodUrl(processorUrl, paymentTokenId),
          undefined,
          "DELETE"
        );
        didRequest = true;
      } else if (removePaymentTokenUrl) {
        await processorRequest<RemovePaymentTokenRequest>(
          requestHeader,
          removePaymentTokenUrl,
          { paymentTokenId }
        );
        didRequest = true;
      }

      if (didRequest && paymentTokens) {
        const filterPaymentTokens = paymentTokens.payment_tokens?.filter(
          (paymentToken) => paymentToken.id !== paymentTokenId
        );
        paymentTokens.payment_tokens = filterPaymentTokens;
        setPaymentTokens({ ...paymentTokens });
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

  // isStoredCheckoutComponent is set once, at the source, by PayPalStoredBuilder (see its own
  // comment) for every component it builds — none of them need the PayPal JS SDK to render —
  // rather than inferred here from paymentMethodType/builderType.
  return (
    <SettingsContext.Provider value={value}>
      {settings || !getSettingsUrl ? (
        isStoredCheckoutComponent ? (
          children
        ) : (
          <PayPalScriptProvider
            options={{
              // Non-null: every mount reaching this branch (i.e. every component not built by
              // PayPalStoredBuilder, see isStoredCheckoutComponent above) always supplies a real
              // `options`.
              ...options!,
              intent: settings?.payPalIntent?.toString().toLowerCase(),
              dataUserIdToken: userIdToken, //todo - verify if removing this for signed in customer still provides correct PayPal button work
              dataPartnerAttributionId: PARTNER_ATTRIBUTION_ID,
              merchantId: settings?.merchantId,
            }}
          >
            {children}
          </PayPalScriptProvider>
        )
      ) : (
        <></>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
