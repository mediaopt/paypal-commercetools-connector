import { defineMessages } from 'react-intl';

export default defineMessages({
  settings: {
    id: 'Settings.settings',
    defaultMessage: 'PayPal Settings',
  },
  account: {
    id: 'Settings.account',
    defaultMessage: 'PayPal account',
  },
  acceptedMethods: {
    id: 'Settings.acceptedMethods',
    defaultMessage: 'Payment Methods Accepted',
  },
  checkoutButtons: {
    id: 'Settings.checkoutButtons',
    defaultMessage: 'PayPal Checkout Buttons',
  },
  checkoutButtonsInfo: {
    id: 'Settings.checkoutButtons.info',
    defaultMessage:
      'Let your customers speed through checkout. Place the PayPal button in multiple places in your purchase experience for optimal results.',
  },
  checkoutButtonsLayout: {
    id: 'Settings.checkoutButtons.Layout',
    defaultMessage: 'Layout:',
  },
  checkoutButtonsColor: {
    id: 'Settings.checkoutButtons.Color',
    defaultMessage: 'Color',
  },
  paylaterMessaging: {
    id: 'Settings.paylaterMessaging',
    defaultMessage: 'PayPal PayLater Messaging',
  },
  paylaterShowOnPages: {
    id: 'Settings.paylaterShowOnPages',
    defaultMessage: 'Show PayLater message on these pages',
  },
  homePage: {
    id: 'Settings.homePage',
    defaultMessage: 'Home page',
  },
  productCategoryPage: {
    id: 'Settings.productCategoryPage',
    defaultMessage: 'Product Category page',
  },
  productDetailsPage: {
    id: 'Settings.productDetailsPage',
    defaultMessage: 'Product Details page',
  },
  cartPage: {
    id: 'Settings.cartPage',
    defaultMessage: 'Cart page',
  },
  paymentPage: {
    id: 'Settings.paymentPage',
    defaultMessage: 'Payment page',
  },
  threeDSSettings: {
    id: 'Settings.threeDSSettings',
    defaultMessage: '3D Secure',
  },
  threeDSNotice: {
    id: 'Settings.threeDSNotice',
    defaultMessage:
      '3D Secure enables you to authenticate card holders through card issuers. It reduces the likelihood of fraud when you use supported cards and improves transaction performance. A successful 3D Secure authentication can shift liability for chargebacks due to fraud from you to the card issuer.',
  },
  payLaterNotice: {
    id: 'Settings.payLaterNotice',
    defaultMessage:
      'When enabled, a PayPal Pay Later button will be shown alongside with the regular PayPal checkout button.',
  },
  threeDSActionTitle: {
    id: 'Settings.threeDSActionTitle',
    defaultMessage: 'Response parameters',
  },
  threeDSWarning: {
    id: 'Settings.threeDSWarning',
    defaultMessage:
      "3D Secure authentication is performed only if the card is enrolled for the service. In scenarios where the 3D Secure authentication hasn't been successful, you have the option to complete the payment at your own risk, meaning that you, as the seller, will be liable in case of a chargeback.",
  },
});
