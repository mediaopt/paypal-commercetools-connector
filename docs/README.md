This connector has three application:

# paypal-commercetools-connector

- Endpoint /paypal-commercetools-extension
  - this extension endpoint handles updates of payments of the type `paypal-payment-type` and customers of type `paypal-customer-type`.
  - updates to the fields `createOrderRequest`, `captureOrderRequest`, etc. will be handled by calling the corresponding PayPal endpoint and returning the response in the corresponding custom fields (e.g. `createOrderResponse`)
  - the docs provide a [Postman Collection](paypal.postman_collection.json) to illustrate the payment and customer update actions to use. The documentation for the collection can be found [here](PayPal.md).
- Endpoint /paypal-webhooks
  - this extension handles webhook messages from PayPal
  - the messages will result in a status 200 response
  - dependent on the webhook message type, payments, transactions and/or customer objects will be updated in commercetools

# paypal-commercetools-custom-application

- this application provides a custom application in the commercetools Merchant Center
- please create a custom application in the commercetools Merchant Center and use the following settings:
  - name: PayPal - Partner Payment Panel
  - URI-Path: paypal-payment-panel
- when deploying the connect app, provide the Custom Application ID that is provided when you added the Custom Application in the Merchant Center

# paypal-commercetools-events

- this application listenes to certain commercetools events
- when a parcel is created for an order which was paid with a PayPal integrated payment, the tracking information will be sent to PayPal (you can deactivate that feature by diableing the `sendTrackingToPayPal` flag in the custom object (key: `settings`, container: `paypal-commercetools-connector`) or in the custom app)
