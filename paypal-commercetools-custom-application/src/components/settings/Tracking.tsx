import { PayPalSettingsType } from '../../types/types';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import CheckboxInput from '@commercetools-uikit/checkbox-input';

const Tracking = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <Spacings.Stack scale="m" alignItems="stretch">
      <Text.Headline as="h3" intlMessage={messages.automation} />
      <CheckboxInput
        isChecked={values.sendTrackingToPayPal}
        onChange={handleChange}
        value="sendTrackingToPayPal"
        name="sendTrackingToPayPal"
      >
        <Text.Body intlMessage={messages.sendTrackingToPayPal} />
      </CheckboxInput>
    </Spacings.Stack>
  );
};

export default Tracking;
