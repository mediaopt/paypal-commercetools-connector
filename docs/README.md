This connector has one application:

# paypal-commercetools-connector

- Endpoint /paypal-commercetools-extension
  - this extension endpoint handles updates of payments of the type `paypal-payment-type` and customers of type `paypal-customer-type`.
  - Updates to the fields `createOrderRequest`, `captureOrderRequest`, etc. will be handled by calling the corresponding PayPal endpoint and returning the response in the corresponding custom fields (e.g. `createOrderResponse`)
  - the docs provide a [postman collection](paypal.postman_collection.json) to illustrate the payment and customer update actions to use. The documentation for the collection can be found [here](PayPal.md).
- Endpoint /paypal-webhooks
  - this extension handles webhook messages from PayPal
  - the messages will result in a status 200 response
  - dependent on the webhook message type, payments, transactions and/or customer objects will be updated in commercetools
