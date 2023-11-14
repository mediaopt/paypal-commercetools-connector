import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import SelectField from '@commercetools-uikit/select-field';
import { PayPalSettingsType } from '../../types/types';
import {
  PayPalButtonColorValues,
  PayPalButtonLabelValues,
} from './SelectFieldValues';

const PayPalButtonConfig = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <Spacings.Stack scale="xs" alignItems="stretch">
      <Text.Body>PayPal Button</Text.Body>
      <Spacings.Inline
        scale="m"
        alignItems="center"
        justifyContent="space-between"
      >
        <SelectField
          title="Color"
          value={values.paypalButtonConfig.buttonColor}
          options={PayPalButtonColorValues}
          name="paypalButtonConfig.buttonColor"
          onChange={handleChange}
        />

        <SelectField
          title="Label"
          value={values.paypalButtonConfig.buttonLabel}
          options={PayPalButtonLabelValues}
          name="paypalButtonConfig.buttonLabel"
          onChange={handleChange}
        />
      </Spacings.Inline>
    </Spacings.Stack>
  );
};

export default PayPalButtonConfig;
