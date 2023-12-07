import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import LocalizedMultilineTextField from '@commercetools-uikit/localized-multiline-text-field';
import Text from '@commercetools-uikit/text';

const RatePay = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3">Rate Pay</Text.Headline>
          <LocalizedMultilineTextField
            title="Brand name"
            name="ratePayBrandName"
            value={values.ratePayBrandName}
            selectedLanguage="de"
            onChange={handleChange}
          />
          <LocalizedMultilineTextField
            title="Logo URL"
            name="ratePayLogoUrl"
            value={values.ratePayLogoUrl}
            selectedLanguage="de"
            onChange={handleChange}
          />
          <LocalizedMultilineTextField
            title="Customer service instructions"
            name="ratePayCustomerServiceInstructions"
            value={values.ratePayCustomerServiceInstructions}
            selectedLanguage="de"
            onChange={handleChange}
          />
        </Spacings.Stack>
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3">Mailing</Text.Headline>
          <LocalizedMultilineTextField
            title="Mail Subject"
            name="payUponInvoiceMailSubject"
            value={values.payUponInvoiceMailSubject}
            selectedLanguage="de"
            onChange={handleChange}
          />
          <LocalizedMultilineTextField
            title="Mail Body"
            name="payUponInvoiceMailEmailText"
            value={values.payUponInvoiceMailEmailText}
            selectedLanguage="de"
            onChange={handleChange}
          />
        </Spacings.Stack>
      </Spacings.Inset>
    </div>
  );
};

RatePay.displayName = 'PayPal RatePay/PayLater Settings';

export default RatePay;
