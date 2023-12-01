import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectField from '@commercetools-uikit/select-field';
import PayPalButtonConfig from './PayPalButtonConfig';
import { PayPalButtonShapeValues } from './SelectFieldValues';

const PayPalCheckoutButtons = ({
  values,
  handleChange,
}: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Text.Headline as="h3" intlMessage={messages.checkoutButtons} />
            <Text.Detail intlMessage={messages.checkoutButtonsInfo} />
          </Spacings.Stack>
          <Spacings.Inline
            scale="m"
            alignItems="center"
            justifyContent="flex-start"
          >
            <CheckboxInput
              isChecked={values.buttonPaymentPage}
              onChange={handleChange}
              value="buttonPaymentPage"
              name="buttonPaymentPage"
            >
              Payment Page
            </CheckboxInput>
            <CheckboxInput
              isChecked={values.buttonCartPage}
              onChange={handleChange}
              value="buttonCartPage"
              name="buttonCartPage"
            >
              Cart
            </CheckboxInput>
            <CheckboxInput
              isChecked={values.buttonDetailPage}
              onChange={handleChange}
              value="buttonDetailPage"
              name="buttonDetailPage"
            >
              Product Details
            </CheckboxInput>
            <CheckboxInput
              isChecked={values.buttonShippingPage}
              onChange={handleChange}
              value="buttonShippingPage"
              name="buttonShippingPage"
            >
              Shipping Details
            </CheckboxInput>
          </Spacings.Inline>
          <Spacings.Inline
            scale="m"
            alignItems="center"
            justifyContent="flex-start"
          >
            <SelectField
              title="Shape"
              value={values.buttonShape}
              options={PayPalButtonShapeValues}
              onChange={handleChange}
              name="buttonShape"
            />
          </Spacings.Inline>
          <PayPalButtonConfig values={values} handleChange={handleChange} />
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

PayPalCheckoutButtons.displayName = 'PayPal Settings - Checkout Buttons';

export default PayPalCheckoutButtons;
