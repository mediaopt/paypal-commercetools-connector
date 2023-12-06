import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectField from '@commercetools-uikit/select-field';
import { FormattedMessage } from 'react-intl';
import Link from '@commercetools-uikit/link';

const PayPalPayLater = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Text.Headline as="h3" intlMessage={messages.paylaterMessaging} />
            <Text.Detail>
              <FormattedMessage
                id="Settings.payLaterMessagingNotice"
                values={{
                  link: (
                    <Link
                      isExternal={true}
                      to={
                        'https://developer.paypal.com/docs/commerce-platforms/admin-panel/'
                      }
                    >
                      <FormattedMessage id="Settings.payLaterMessagingNoticeLink" />
                    </Link>
                  ),
                }}
              />
            </Text.Detail>
          </Spacings.Stack>
          <Spacings.Stack scale="s" alignItems="stretch">
            <Text.Body intlMessage={messages.paylaterShowOnPages} />
            <Spacings.Inline
              scale="m"
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <CheckboxInput
                isChecked={values.payLaterMessageHomePage}
                onChange={handleChange}
                value="payLaterMessageHomePage"
                name="payLaterMessageHomePage"
              >
                <Text.Body intlMessage={messages.homePage} />
              </CheckboxInput>
              <CheckboxInput
                isChecked={values.payLaterMessageCategoryPage}
                onChange={handleChange}
                value="payLaterMessageCategoryPage"
                name="payLaterMessageCategoryPage"
              >
                <Text.Body intlMessage={messages.productCategoryPage} />
              </CheckboxInput>
              <CheckboxInput
                isChecked={values.payLaterMessageDetailsPage}
                onChange={handleChange}
                value="payLaterMessageDetailsPage"
                name="payLaterMessageDetailsPage"
              >
                <Text.Body intlMessage={messages.productDetailsPage} />
              </CheckboxInput>
              <CheckboxInput
                isChecked={values.payLaterMessageCartPage}
                onChange={handleChange}
                value="payLaterMessageCartPage"
                name="payLaterMessageCartPage"
              >
                <Text.Body intlMessage={messages.cartPage} />
              </CheckboxInput>
              <CheckboxInput
                isChecked={values.payLaterMessagePaymentPage}
                onChange={handleChange}
                value="payLaterMessagePaymentPage"
                name="payLaterMessagePaymentPage"
              >
                <Text.Body intlMessage={messages.paymentPage} />
              </CheckboxInput>
            </Spacings.Inline>
          </Spacings.Stack>
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Text.Headline as="h3">Look & Feel</Text.Headline>
            <Text.Detail>
              <FormattedMessage
                id="Settings.paylaterInfoText"
                values={{
                  link: (
                    <Link
                      isExternal={true}
                      to={
                        'https://developer.paypal.com/docs/checkout/pay-later/us/integrate/customize-messages/'
                      }
                    >
                      <FormattedMessage id="Settings.paylaterInfoTextLink" />
                    </Link>
                  ),
                }}
              />
            </Text.Detail>
          </Spacings.Stack>
          <Spacings.Inline
            scale="m"
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <SelectField
              title="Layout on home page"
              value={values.payLaterMessagingType.home}
              options={[
                { value: 'flex', label: 'flex' },
                { value: 'text', label: 'text' },
              ]}
              name="payLaterMessagingType.home"
              onChange={handleChange}
            />
            <SelectField
              title="Layout on category page"
              value={values.payLaterMessagingType.category}
              options={[
                { value: 'flex', label: 'flex' },
                { value: 'text', label: 'text' },
              ]}
              name="payLaterMessagingType.category"
              onChange={handleChange}
            />
            <SelectField
              title="Layout on product page"
              value={values.payLaterMessagingType.product}
              options={[
                { value: 'flex', label: 'flex' },
                { value: 'text', label: 'text' },
              ]}
              name="payLaterMessagingType.product"
              onChange={handleChange}
            />
            <SelectField
              title="Layout on payment page"
              value={values.payLaterMessagingType.payment}
              options={[
                { value: 'flex', label: 'flex' },
                { value: 'text', label: 'text' },
              ]}
              name="payLaterMessagingType.payment"
              onChange={handleChange}
            />
            <SelectField
              title="Layout on cart page"
              value={values.payLaterMessagingType.cart}
              options={[
                { value: 'flex', label: 'flex' },
                { value: 'text', label: 'text' },
              ]}
              name="payLaterMessagingType.cart"
              onChange={handleChange}
            />
          </Spacings.Inline>
          <Spacings.Stack scale="s" alignItems="stretch">
            <Text.Subheadline>Text settings</Text.Subheadline>
            <Spacings.Inline
              scale="m"
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <SelectField
                title="Logo type"
                value={values.payLaterMessageTextLogoType}
                options={[
                  { value: 'inline', label: 'inline' },
                  { value: 'primary', label: 'primary' },
                  { value: 'alternative', label: 'alternative' },
                  { value: 'none', label: 'none' },
                ]}
                name="payLaterMessageTextLogoType"
                onChange={handleChange}
              />
              <SelectField
                title="Logo position"
                value={values.payLaterMessageTextLogoPosition}
                options={[
                  { value: 'left', label: 'left' },
                  { value: 'right', label: 'right' },
                  { value: 'top', label: 'top' },
                ]}
                name="payLaterMessageTextLogoPosition"
                onChange={handleChange}
              />
              <SelectField
                title="Text color"
                value={values.payLaterMessageTextColor}
                options={[
                  { value: 'black', label: 'black' },
                  { value: 'white', label: 'white' },
                  { value: 'monochrome', label: 'monochrome' },
                  { value: 'grayscale', label: 'grayscale' },
                ]}
                name="payLaterMessageTextColor"
                onChange={handleChange}
              />
              <SelectField
                title="Text size"
                value={values.payLaterMessageTextSize}
                options={[
                  { value: '10', label: '10' },
                  { value: '11', label: '11' },
                  { value: '12', label: '12' },
                  { value: '13', label: '13' },
                  { value: '14', label: '14' },
                  { value: '15', label: '15' },
                  { value: '16', label: '16' },
                ]}
                name="payLaterMessageTextSize"
                onChange={handleChange}
              />
              <SelectField
                title="Text align"
                value={values.payLaterMessageTextAlign}
                options={[
                  { value: 'left', label: 'left' },
                  { value: 'center', label: 'center' },
                  { value: 'right', label: 'right' },
                ]}
                name="payLaterMessageTextAlign"
                onChange={handleChange}
              />
            </Spacings.Inline>
          </Spacings.Stack>
          <Spacings.Stack scale="s" alignItems="stretch">
            <Text.Subheadline>Flex settings</Text.Subheadline>
            <Spacings.Inline
              scale="m"
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <SelectField
                title="Color"
                value={values.payLaterMessageFlexColor}
                options={[
                  { value: 'blue', label: 'blue' },
                  { value: 'black', label: 'black' },
                  { value: 'white', label: 'white' },
                  { value: 'white-no-border', label: 'white-no-border' },
                  { value: 'gray', label: 'gray' },
                  { value: 'monochrome', label: 'monochrome' },
                  { value: 'grayscale', label: 'grayscale' },
                ]}
                name="payLaterMessageFlexColor"
                onChange={handleChange}
              />
              <SelectField
                title="Ratio"
                value={values.payLaterMessageFlexRatio}
                options={[
                  { value: '1x1', label: '1x1' },
                  { value: '1x4', label: '1x4' },
                  { value: '8x1', label: '8x1' },
                  { value: '20x1', label: '20x1' },
                ]}
                name="payLaterMessageFlexRatio"
                onChange={handleChange}
              />
            </Spacings.Inline>
          </Spacings.Stack>
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

PayPalPayLater.displayName = 'PayPal - PayLater Messaging Settings';

export default PayPalPayLater;
