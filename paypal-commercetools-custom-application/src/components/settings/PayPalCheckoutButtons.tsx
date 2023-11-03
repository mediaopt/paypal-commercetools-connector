import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import Grid from '@commercetools-uikit/grid';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectField from '@commercetools-uikit/select-field';
import RadioInput from '@commercetools-uikit/radio-input';

const PayPalCheckoutButtons = ({
  values,
  handleChange,
}: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Grid
          display="grid"
          gridGap="16px"
          gridAutoColumns="1fr"
          gridTemplateColumns="3fr 1fr"
        >
          <Grid.Item>
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
                  options={[
                    { value: 'rectangle', label: 'Rectangle' },
                    { value: 'pill', label: 'Pill' },
                  ]}
                  onChange={handleChange}
                  name="buttonShape"
                />
                <CheckboxInput
                  onChange={handleChange}
                  isChecked={values.buttonTagline}
                  value="buttonTagline"
                  name="buttonTagline"
                >
                  <Text.Body nowrap={true}>Display Tagline Text</Text.Body>
                </CheckboxInput>
              </Spacings.Inline>
              <Spacings.Inline
                scale="m"
                alignItems="flex-end"
                justifyContent="flex-start"
              >
                <Spacings.Stack scale="xs" alignItems="flex-start">
                  <Text.Body intlMessage={messages.checkoutButtonsColor} />
                  <div className={styles.border}>
                    <RadioInput.Group
                      directionProps={{ scale: 'm' }}
                      direction="inline"
                      horizontalConstraint="scale"
                      value={values.buttonColor}
                      name="buttonColor"
                      onChange={handleChange}
                    >
                      <RadioInput.Option value="blue">
                        <div className={styles.colorBlue}></div>
                      </RadioInput.Option>
                      <RadioInput.Option value="gold">
                        <div className={styles.colorGold}></div>
                      </RadioInput.Option>
                      <RadioInput.Option value="gray">
                        <div className={styles.colorGray}></div>
                      </RadioInput.Option>
                      <RadioInput.Option value="white">
                        <div className={styles.colorWhite}></div>
                      </RadioInput.Option>
                      <RadioInput.Option value="black">
                        <div className={styles.colorBlack}></div>
                      </RadioInput.Option>
                    </RadioInput.Group>
                  </div>
                </Spacings.Stack>
                <SelectField
                  title="Label"
                  value={values.buttonLabel}
                  options={[{ value: 'pay', label: 'Pay' }]}
                  name="buttonLabel"
                />
              </Spacings.Inline>
            </Spacings.Stack>
          </Grid.Item>
          <Grid.Item>Preview here</Grid.Item>
        </Grid>
      </Spacings.Inset>
    </div>
  );
};

PayPalCheckoutButtons.displayName = 'PayPal Settings - Checkout Buttons';

export default PayPalCheckoutButtons;
