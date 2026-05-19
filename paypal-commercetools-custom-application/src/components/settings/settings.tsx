import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import PrimaryButton from '@commercetools-uikit/primary-button';
import './settings.module.css';

import PayPalSettings from './PayPalSettings';
import PayPalCheckoutButtons from './PayPalCheckoutButtons';
import PayPalPayLater from './PayPalPayLater';
import ThreeDSecure from './ThreeDSecure';
import RatePay from './RatePay';
import HostedFields from './HostedFields';
import Tracking from './Tracking';

import {
  useFetchLanguages,
  useFetchSettings,
  useSetSettings,
} from '../connector-hooks/use-customObject-connector';

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

import { SettingsPropComponent } from '../types';
import { PAYMENT_DEFAULTS } from './constants';
type SettingsProp = {
  component: SettingsPropComponent;
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
      case 'settings':
        return <PayPalSettings values={values} handleChange={handleChange} />;
      case 'payPalCheckoutButtons':
        return (
          <PayPalCheckoutButtons values={values} handleChange={handleChange} />
        );
      case 'payPalPayLater':
        return <PayPalPayLater values={values} handleChange={handleChange} />;
      case 'threeDS':
        return <ThreeDSecure values={values} handleChange={handleChange} />;
      case 'ratePay':
        return <RatePay values={values} handleChange={handleChange} />;
      case 'tracking':
        return <Tracking values={values} handleChange={handleChange} />;
      case 'ccFields':
        return <HostedFields values={values} handleChange={handleChange} />;
      default:
        return <></>;
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
            <div className="border">
              <Spacings.Inset scale="m">
                {getComponent({ values, handleChange })}
              </Spacings.Inset>
            </div>
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
                    ...PAYMENT_DEFAULTS[component],
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
