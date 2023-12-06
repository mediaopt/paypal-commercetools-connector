import { PayPalSettingsType } from '../../types/types';
import styles from './settings.module.css';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import LocalizedMultilineTextField from '@commercetools-uikit/localized-multiline-text-field';

const PayUponInvoice = ({ values, handleChange }: PayPalSettingsType) => {
  return (
    <div className={styles.border}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3">Pay Upon Invoice Mailing</Text.Headline>
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

export default PayUponInvoice;
