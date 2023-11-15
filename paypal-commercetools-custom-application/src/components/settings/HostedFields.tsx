import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';

const HostedFields = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Text.Headline as="h3">Hosted Fields</Text.Headline>
            <Text.Detail></Text.Detail>
          </Spacings.Stack>
          <TextField
            title="Pay button classes"
            hint="overwrite default classes to style the pay button"
            value={values.hostedFieldsPayButtonClasses}
            name="hostedFieldsPayButtonClasses"
            onChange={handleChange}
          />
          <TextField
            title="Input field classes"
            hint="overwrite default classes to style the input fields"
            value={values.hostedFieldsInputFieldClasses}
            name="hostedFieldsInputFieldClasses"
            onChange={handleChange}
          />
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

export default HostedFields;
