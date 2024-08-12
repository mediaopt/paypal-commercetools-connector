Here we present a simplified sequence diagram for payment process with PayPal buy now payment. For full detailed process please refer to [Architecture.pdf](../Architecture.pdf).

In this diagram we focus on the interaction with the PayPal commercetools connector and PayPal client app required to complete the payment. 

The communication between commercetools frontend (CoFe) and commercetools HTTP API (CoCo) that is not related directly to the payment with PayPal is not explained in this diagram. In brief CoFe has built in routines to update the cart and the payment whenever they might have being changed.

The official documentation for the API mentioned it the diagram can be found at [commercetools Frontend API's](https://docs.commercetools.com/frontend-api/action), [commercetools HTTP API](https://docs.commercetools.com/http-api), and [PayPal orders v2 API](https://developer.paypal.com/docs/api/orders/v2/).

```mermaid
sequenceDiagram
    title PayPal payment flow
    box CoFe 
    participant frontend as frontend/client app
    participant backend 
    end
    participant CoCo as CoCo/connector (extension)
    Note over frontend,backend: commercetools Frontend API
    Note over backend, CoCo: commercetools HTTP API,<br/> connector: endpoint custom-objects <br/>or action custom fields
    Note over CoCo, PayPal: PayPal orders v2 API
    Note over frontend, CoCo: Cart is created by built in CoFe methods and has products and user data in it
    frontend-->>backend: getSettings action
    backend-->>CoCo: getSetting request
    Note over backend, CoCo: endpoint >custom-objects/<br/>paypal-commercetools-connector
    CoCo-->>backend: GetSettingsResponse
    backend-->>frontend: GetSettingsResponse, Session data
    frontend-->>backend: createPayment action
    backend-->>CoCo: createPayment request
    note over backend, CoCo: paymentInterface: 'PayPal'
    CoCo-->>backend: createPayment response
    backend-->>CoCo: updateCart request
    note over backend, CoCo: action addPayment
    CoCo-->>backend: updateCart response
    backend-->>frontend: cart data, payment data, session data
    frontend-->>frontend: render payment component(s)
    frontend-->>frontend: user clicks on buy now button
    frontend-->>backend: createOrder action.
    backend-->>CoCo: createPayPalOrder request
    Note over backend, CoCo: endpoint payments/{{payment-id}}<br/>action setCustomField
    CoCo-->>PayPal: PayPal createOrder request
    PayPal-->>CoCo: PayPal createOrder response
    CoCo-->>CoCo: update payment request
    CoCo-->>backend: createPayPal order response
    backend-->>frontend: createPayPal order response, payment data
    create participant window as PayPal floating window
    frontend-->>window: PayPal order data
    window-->>window: user approves the payment
    destroy window
    window-->>frontend: order approve
    frontend-->>backend: captureOrder action
    backend-->>CoCo: capturePayPal order request
    Note over backend, CoCo: endpoint payments/{{payment-id}}<br/>action setCustomField
    CoCo-->>backend: capturePayPal order response
    backend-->>frontend: capturePayPal order response, payment data
```