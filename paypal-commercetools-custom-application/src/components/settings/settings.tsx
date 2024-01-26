import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import PrimaryButton from '@commercetools-uikit/primary-button';
import PayPalSettings from './PayPalSettings';
import PayPalCheckoutButtons from './PayPalCheckoutButtons';
import PayPalPayLater from './PayPalPayLater';
import {
  useFetchLanguages,
  useFetchSettings,
  useSetSettings,
} from '../connector-hooks/use-customObject-connector';
import { useEffect, useState } from 'react';
import {
  ApollonFetchedCustomObjectType,
  PayPalSettingsType,
  SettingsFormDataType,
} from '../../types/types';
import {
  GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
  GRAPHQL_CUSTOMOBJECT_KEY_NAME,
} from '../../constants';
import { DEFAULT_SETTINGS } from './defaultSettings';
import ThreeDSecure from './ThreeDSecure';
import RatePay from './RatePay';
import HostedFields from './HostedFields';
import Tracking from './Tracking';
type SettingsProp = {
  component:
    | 'Settings'
    | 'CheckoutButtons'
    | 'PayLater'
    | 'ThreeDS'
    | 'RatePay'
    | 'Tracking'
    | 'CCFields'
    | '';
};
const Settings = ({ component }: SettingsProp) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLanguageReady, setIsLanguageReady] = useState<boolean>(false);
  const [customObjectVersion, setCustomObjectVersion] = useState<number>();
  const [settingsObject, setSettingsObject] =
    useState<SettingsFormDataType>(DEFAULT_SETTINGS);
  const { customObject, error, loading } = useFetchSettings(
    GRAPHQL_CUSTOMOBJECT_KEY_NAME,
    GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME
  );
  const { languages, languageError, languageLoading } = useFetchLanguages();
  const [setSettingsFunc] = useSetSettings();

  const saveSettings = (values: SettingsFormDataType) => {
    // @ts-ignore
    setSettingsFunc({
      variables: {
        draftOfCustomObject: {
          container: GRAPHQL_CUSTOMOBJECT_CONTAINER_NAME,
          key: GRAPHQL_CUSTOMOBJECT_KEY_NAME,
          version: customObjectVersion,
          value: JSON.stringify(values),
        },
      },
    }).then((result: ApollonFetchedCustomObjectType) => {
      setCustomObjectVersion(result.data.createOrUpdateCustomObject.version);
      setSettingsObject(result.data.createOrUpdateCustomObject.value);
    });
  };

  const setMissingLanguages = () => {
    const filteredLanguages = languages?.filter(
      (lang) => !Object.keys(settingsObject.paymentDescription).includes(lang)
    );
    filteredLanguages.forEach((lang) => {
      settingsObject.paymentDescription[lang] = '';
    });
    setSettingsObject(settingsObject);
    setIsReady(true);
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    if (error) {
      console.error(error);
    } else {
      setCustomObjectVersion(customObject.version);
      setSettingsObject({ ...DEFAULT_SETTINGS, ...customObject.value });
      setIsLanguageReady(true);
    }
  }, [customObject, error, loading]);

  useEffect(() => {
    if (languageLoading || !isLanguageReady) {
      return;
    }
    if (languageError) {
      console.error(languageError);
      return;
    }
    setMissingLanguages();
  }, [languages, languageLoading, languageError, isLanguageReady]);

  const getComponent = ({ values, handleChange }: PayPalSettingsType) => {
    switch (component) {
      case 'Settings':
        return <PayPalSettings values={values} handleChange={handleChange} />;
      case 'CheckoutButtons':
        return (
          <PayPalCheckoutButtons values={values} handleChange={handleChange} />
        );
      case 'PayLater':
        return <PayPalPayLater values={values} handleChange={handleChange} />;
      case 'ThreeDS':
        return <ThreeDSecure values={values} handleChange={handleChange} />;
      case 'RatePay':
        return <RatePay values={values} handleChange={handleChange} />;
      case 'Tracking':
        return <Tracking values={values} handleChange={handleChange} />;
      case 'CCFields':
        return <HostedFields values={values} handleChange={handleChange} />;
      default:
        return <></>;
    }
  };

  const getComponentDefaults = (): Record<string, any> => {
    switch (component) {
      case 'Settings':
        return {
          merchantId: DEFAULT_SETTINGS.merchantId,
          acceptPayPal: DEFAULT_SETTINGS.acceptPayPal,
          acceptPayLater: DEFAULT_SETTINGS.acceptPayLater,
          acceptVenmo: DEFAULT_SETTINGS.acceptVenmo,
          acceptLocal: DEFAULT_SETTINGS.acceptLocal,
          acceptCredit: DEFAULT_SETTINGS.acceptCredit,
          payPalIntent: DEFAULT_SETTINGS.payPalIntent,
          paymentDescription: DEFAULT_SETTINGS.paymentDescription,
          storeInVaultOnSuccess: DEFAULT_SETTINGS.storeInVaultOnSuccess,
        };
      case 'CheckoutButtons':
        return {
          buttonPaymentPage: DEFAULT_SETTINGS.buttonPaymentPage,
          buttonCartPage: DEFAULT_SETTINGS.buttonCartPage,
          buttonDetailPage: DEFAULT_SETTINGS.buttonDetailPage,
          buttonShippingPage: DEFAULT_SETTINGS.buttonShippingPage,
          buttonShape: DEFAULT_SETTINGS.buttonShape,
          paypalButtonConfig: DEFAULT_SETTINGS.paypalButtonConfig,
        };
      case 'PayLater':
        return {
          payLaterMessagingType: DEFAULT_SETTINGS.payLaterMessagingType,
          payLaterMessageCartPage: DEFAULT_SETTINGS.payLaterMessageCartPage,
          payLaterMessagePaymentPage:
            DEFAULT_SETTINGS.payLaterMessagePaymentPage,
          payLaterMessageCategoryPage:
            DEFAULT_SETTINGS.payLaterMessageCategoryPage,
          payLaterMessageDetailsPage:
            DEFAULT_SETTINGS.payLaterMessageDetailsPage,
          payLaterMessageHomePage: DEFAULT_SETTINGS.payLaterMessageHomePage,
          payLaterMessageTextLogoType:
            DEFAULT_SETTINGS.payLaterMessageTextLogoType,
          payLaterMessageTextLogoPosition:
            DEFAULT_SETTINGS.payLaterMessageTextLogoPosition,
          payLaterMessageTextColor: DEFAULT_SETTINGS.payLaterMessageTextColor,
          payLaterMessageTextSize: DEFAULT_SETTINGS.payLaterMessageTextSize,
          payLaterMessageTextAlign: DEFAULT_SETTINGS.payLaterMessageTextAlign,
          payLaterMessageFlexColor: DEFAULT_SETTINGS.payLaterMessageFlexColor,
          payLaterMessageFlexRatio: DEFAULT_SETTINGS.payLaterMessageFlexRatio,
        };
      case 'ThreeDS':
        return {
          threeDSOption: DEFAULT_SETTINGS.threeDSOption,
          threeDSAction: DEFAULT_SETTINGS.threeDSAction,
        };
      case 'RatePay':
        return {
          ratePayBrandName: DEFAULT_SETTINGS.ratePayBrandName,
          ratePayLogoUrl: DEFAULT_SETTINGS.ratePayLogoUrl,
          ratePayCustomerServiceInstructions:
            DEFAULT_SETTINGS.ratePayCustomerServiceInstructions,
          payUponInvoiceMailSubject: DEFAULT_SETTINGS.payUponInvoiceMailSubject,
          payUponInvoiceMailEmailText:
            DEFAULT_SETTINGS.payUponInvoiceMailEmailText,
        };
      case 'Tracking':
        return {
          sendTrackingToPayPal: DEFAULT_SETTINGS.sendTrackingToPayPal,
        };
      case 'CCFields':
        return {
          hostedFieldsPayButtonClasses:
            DEFAULT_SETTINGS.hostedFieldsPayButtonClasses,
          hostedFieldsInputFieldClasses:
            DEFAULT_SETTINGS.hostedFieldsInputFieldClasses,
        };
      default:
        return {};
    }
  };

  if (!isReady) {
    return <></>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={settingsObject}
      onSubmit={(values) => {
        saveSettings(values);
      }}
    >
      {({ values, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Spacings.Stack alignItems="stretch" scale="xl">
            {getComponent({ values, handleChange })}
            <Spacings.Inline
              scale="s"
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <PrimaryButton label="save" type="submit" />
              <PrimaryButton
                label="reset current settings"
                onClick={() => {
                  saveSettings({
                    ...values,
                    ...getComponentDefaults(),
                  });
                }}
                tone="critical"
              />
            </Spacings.Inline>
          </Spacings.Stack>
        </form>
      )}
    </Formik>
  );
};
Settings.displayName = 'Settings Overview';

export default Settings;
