import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectField from '@commercetools-uikit/select-field';
import LocalizedMultilineTextField from '@commercetools-uikit/localized-multiline-text-field';
import { useIntl } from 'react-intl';
import { PayPalDisbursementModeValues } from './SelectFieldValues';

const PayPalSettings = ({ values, handleChange }: PayPalSettingsType) => {
  const intl = useIntl();
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack alignItems="stretch" scale="m">
          <Text.Headline as="h3" intlMessage={messages.settings} />
          <Text.Headline as="h3" intlMessage={messages.acceptedMethods} />
          <Spacings.Stack scale="m" alignItems="flex-start">
            <CheckboxInput
              isChecked={values.acceptPayPal}
              onChange={handleChange}
              value="acceptPayPal"
              name="acceptPayPal"
            >
              PayPal
            </CheckboxInput>
            <Spacings.Inline
              scale="s"
              alignItems="center"
              justifyContent="flex-start"
            >
              <CheckboxInput
                isChecked={values.acceptPayLater}
                onChange={handleChange}
                value="acceptPayLater"
                name="acceptPayLater"
              >
                PayPal PayLater
              </CheckboxInput>
              <Text.Detail intlMessage={messages.payLaterNotice} />
            </Spacings.Inline>
            <CheckboxInput
              isChecked={values.acceptVenmo}
              onChange={handleChange}
              value="acceptVenmo"
              name="acceptVenmo"
            >
              Venmo
            </CheckboxInput>
            <CheckboxInput
              isChecked={values.acceptLocal}
              onChange={handleChange}
              value="acceptLocal"
              name="acceptLocal"
            >
              Local Alternative Payment Methods
            </CheckboxInput>
            <CheckboxInput
              isChecked={values.acceptCredit}
              onChange={handleChange}
              value="acceptCredit"
              name="acceptCredit"
            >
              Credit & Debit Cards
            </CheckboxInput>
          </Spacings.Stack>
          <Spacings.Inline
            scale="xs"
            alignItems="center"
            justifyContent="flex-start"
          >
            <SelectField
              title="Intent"
              value={values.payPalIntent}
              options={[
                { value: 'Authorize', label: 'Authorize' },
                { value: 'Capture', label: 'Capture' },
              ]}
              name="payPalIntent"
              onChange={handleChange}
            />
          </Spacings.Inline>
          <LocalizedMultilineTextField
            title="Payment description"
            name="paymentDescription"
            value={values.paymentDescription}
            selectedLanguage="en"
            onChange={handleChange}
          />
          <CheckboxInput
            isChecked={values.storeInVaultOnSuccess}
            onChange={handleChange}
            value="storeInVaultOnSuccess"
            name="storeInVaultOnSuccess"
          >
            Store payment info in vault on successful payment
          </CheckboxInput>
          <Spacings.Stack scale="xs" alignItems="flex-start">
            <SelectField
              value={values.disbursementMode}
              options={PayPalDisbursementModeValues}
              title="Disbursement Mode"
              hint={intl.formatMessage({
                id: 'Settings.disbursementMode',
              })}
              name="disbursementMode"
              onChange={handleChange}
            />
            <Spacings.Inline
              scale="xs"
              alignItems="center"
              justifyContent="flex-start"
            >
              <Text.Detail isBold>INSTANT</Text.Detail>
              <Text.Detail intlMessage={messages.disbursementModeInstant} />
            </Spacings.Inline>
            <Spacings.Inline
              scale="xs"
              alignItems="center"
              justifyContent="flex-start"
            >
              <Text.Detail isBold>DELAYED</Text.Detail>
              <Text.Detail intlMessage={messages.disbursementModeDelayed} />
            </Spacings.Inline>
          </Spacings.Stack>
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

PayPalSettings.displayName = 'PayPal Settings';

export default PayPalSettings;
