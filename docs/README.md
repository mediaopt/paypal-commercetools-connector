This connector has five applications:

# paypal-commercetools-connector

- Endpoint /paypal-commercetools-extension
  - this extension endpoint handles updates of payments of the type `paypal-payment-type` and customers of type `paypal-customer-type`.
  - updates to the fields `createOrderRequest`, `captureOrderRequest`, etc. will be handled by calling the corresponding PayPal endpoint and returning the response in the corresponding custom fields (e.g. `createOrderResponse`)
  - it should be called by the merchant's backend
  - the docs provide a [Postman Collection](paypal.postman_collection.json) to illustrate the payment and customer update actions to use. The documentation for the collection can be found [here](PayPal.md).
- Endpoint /paypal-webhooks
  - this extension handles webhook messages from PayPal
  - the messages will result in a status 200 response
  - dependent on the webhook message type, payments, transactions and/or customer objects will be updated in commercetools

# paypal-commercetools-custom-application

- this application provides a custom application in the commercetools Merchant Center
- in checkout mode only a limited set of settings is supported, and the Checkout application and `processor` environment settings take priority over the custom application. Please open an issue if you are interested in any settings support not included yet.
- the custom application creates a new entry in the merchant center menu where you can adjust certain settings for PayPal including
  - accepted payment methods
  - whether the intent should be capture or authorize
  - where to include the checkout buttons
  - the styling of the buttons
  - 3D secure settings
  - PayLater Messaging
  - RatePay
- please create a custom application in the commercetools Merchant Center and use the following settings:
  - name: PayPal - Partner Payment Panel
  - URI-Path: paypal-payment-panel
- when deploying the connect app, provide the Custom Application ID that is provided when you added the Custom Application in the Merchant Center

# paypal-commercetools-events

- this application listenes to certain commercetools events:
  - when a parcel is created for an order which was paid with a PayPal integrated payment, the tracking information will be sent to PayPal (you can deactivate that feature by diableing the `sendTrackingToPayPal` flag in the custom object (key: `settings`, container: `paypal-commercetools-connector`) or in the custom app)

# enabler

- frontend payment components for commercetools Checkout
- built from the former [npm client](https://www.npmjs.com/package/paypal-commercetools-client) and the [workflows integration example](workflows/README.md), which are no longer supported
- merchants not using commercetools Checkout can still host the components themselves (legacy mode)
- see [enabler/README.md](../enabler/README.md) for the differences between legacy mode and Checkout mode and for [local development](../enabler/README.md#local-development)

# processor

- backend-for-frontend for `enabler`, which merchants previously had to build themselves
- see [processor/README.md](../processor/README.md) for local development, required API scopes, endpoints and authentication
- reached only through commercetools Checkout and the Payment Intents API, not called directly by the merchant
