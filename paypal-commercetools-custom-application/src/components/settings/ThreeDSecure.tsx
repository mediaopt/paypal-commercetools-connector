import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import SelectField from '@commercetools-uikit/select-field';
import ThreeDSecureAcceptanceMatrix from './ThreeDSecureAcceptanceMatrix';

const ThreeDSecure = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Text.Headline as="h3" intlMessage={messages.threeDSSettings} />
            <Text.Detail intlMessage={messages.threeDSNotice} />
          </Spacings.Stack>
          <Spacings.Inline
            scale="m"
            alignItems="center"
            justifyContent="flex-start"
          >
            <SelectField
              title="3D Secure authentication"
              value={values.threeDSOption}
              hint={
                <Text.Detail
                  tone="warning"
                  intlMessage={messages.threeDSWarning}
                />
              }
              options={[
                { value: '', label: 'Disabled' },
                { value: 'SCA_WHEN_REQUIRED', label: 'SCA_WHEN_REQUIRED' },
                { value: 'SCA_ALWAYS', label: 'SCA_ALWAYS' },
              ]}
              name="threeDSOption"
              onChange={handleChange}
            />
          </Spacings.Inline>
          {values.threeDSOption !== '' && (
            <ThreeDSecureAcceptanceMatrix
              values={values}
              handleChange={handleChange}
            />
          )}
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

ThreeDSecure.displayName = 'PayPal Settings - 3D Secure';

export default ThreeDSecure;
