<p style="text-align: center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a><br/>
    <a href="https://www.paypal.com/de/business/accept-payments">
    <img alt="PayPal logo" src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-200px.png">
  </a><br>
</p>

In this folder you can find simplified example workflows for the PayPal commercetools connector, which should be sufficient to reproduce demonstrated payments. For all details please refer to [Architecture.pdf](../Architecture.pdf). 

Here we summarize the actual workflows for:
1. using only the connector for the backend side implementation 
2. using the [PayPal client](https://www.npmjs.com/package/paypal-commercetools-client) in commercetools Frontend (CoFe) [integration](https://github.com/mediaopt/paypal-commercetools-cofe-integration/tree/main).

The workflow that only includes backend calls through Postman is provided as a [workflow Postman Collection](PayPal-commercetools-workflow.postman_collection.json).

The sequence diagram that shows more details about the backend side of a payment process with PayPal Buy Now payment is also provided at [sequence_diagram_paypal_payment.md](sequence_diagram_paypal_payment.md).

# Table of Contents

- [Installation](#installation)
  - [Connector installation](#connector-installation)
  - [Frontend installation](#frontend-installation)
- [Payment Process](#payment-process)
  - [Backend only flow](#backend-only-flow)
    - [Initial flow](#initial-flow)
    - [Payment method specific flow](#payment-method-specific-flow)
      - [Pay Upon Invoice](#pay-upon-invoice)
      - [PayPal](#paypal)
      - [Card payment](#card-payment)
  - [Standard flow](#standard-flow)
    - [Rendering payment buttons](#rendering-payment-buttons)
    - [Payment methods parameters](#payment-methods-parameters)
    - [Payment method dependent flow](#payment-method-dependent-flow)
      - [PayPal Buy Now](#paypal-buy-now)
      - [Card](#card)
      - [Pay Upon Invoice](#pay-upon-invoice-1)

# Installation

For installation of CoFe please refer to [commercetools official documentation](https://commercetools.com/products/frontend). If you prefer to use the PayPal JS SDK instead of the PayPal client app, please refer to [PayPal official documentation](https://developer.paypal.com/sdk/js/).

## Connector installation

There are two possible ways to integrate the connector, both fully covered in the following documentation.

1. Installed [directly from the commercetools marketplace](https://docs.commercetools.com/merchant-center/connect).
2. Create your own deployment using [commercetools connect API](https://docs.commercetools.com/connect/getting-started).

The connector includes a merchant center application, which is automatically installed and deployed when installing the connector. If the custom application doesn't work correct after deployment please [check if its link is up-to-date](https://docs.commercetools.com/merchant-center-customizations/deployment-examples/commercetools-connect).

## Frontend installation

The client can be directly installed to the shop frontend using npm:

`npm i paypal-commercetools-client`

The client is react-based, so for other frameworks it is needed to load the React script in project stack.

And then the components are imported directly from the package, see for example the [payment form in CoFe integration](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx).



# Payment Process

To start the payment process with the connector the preliminary prepared commercetools cart and payment is required. In our case we have used the CoFe frontend to create the cart and the payment, but the example process through the [commercetools HTTP API](https://docs.commercetools.com/api/) is also provided in Postman collection and can be separated to following steps:

## Backend only flow

The backend flow that we provide as a collection can be separated to three parts:

1. creating the cart and payment via standard commercetools HTTP api, which we provide only to get reliable example of the cart for all payments,
2. PayPal specific part, which includes setting the custom type for payment and obtaining the client token.
3. PayPal payment method specific part, that can differ for different payment methods

The first two categories are covered in the Postman collection Initial part, the third is provided separately for some methods in the corresponding subfolder of the Payment specific folder. To go through the whole payment process of a target method you need to follow first all the calls in initial folder in a Postman collection and then all the specific for this method. All the necessary data are already provided in the collection, so you can just run the requests and see the results.

## Initial flow

| Step | Description                                                                                                                                            | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | If not yet - [obtain commercetools access token](https://docs.commercetools.com/api/authorization).                                                    | getAccessToken                                                                       |
| 2    | [Create a cart](https://docs.commercetools.com/api/projects/carts) with some products in it. Products can be added during creation or added separately | Search for a product -> Create Cart -> AddLineItem                                   |
| 3    | [Create a payment](https://docs.commercetools.com/api/projects/payments) with the `paypal-payment-type`.                                               | SetCustomType For Payment                                                            |
| 4    | Link the payment to the cart                                                                                                                           | AddPayment                                                                           |
| 5    | If not yet - get client token for communication with PayPal                                                                                            | getClientToken                                                                       |

We recommend to use commercetools taxCalculationMode **UnitPriceLevel** for the cart to ensure matching price mapping on both PayPal and Commercetool sites. See [commercetools documentation](https://docs.commercetools.com/api/projects/carts#taxcalculationmode) for details.

## Payment method specific flow

MOST OF THE METHODS REQUIRES USER APPROVAL AFTER CREATE PAYPAL ORDER. IT MEANS THAT THE USER SHOULD APPROVE THE ORDER VIA THE LINK, PROVIDED IN THE RESPONSE.

In case if this is applicable for a certain method - it is mentioned in the method description. For sandbox testing PayPal sandbox customer credentials or [sandbox testing cards provided by PayPal](https://developer.paypal.com/tools/sandbox/card-testing/) can be used to approve the order.

### Pay Upon Invoice

Pay Upon invoice is the simplest as the payment is not processed immediately.

| Step | Description                                    | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with Invoice as payment source | createPayPalOrder                                                                    |

### PayPal

| Step | Description                                                                                         | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with PayPal as payment source                                                       | createPayPalOrder                                                                    |
| 2    | In your browser open the link with the "rel" approve in create order response and approve the order | -                                                                                    |
| 3    | Get payment by id, to update the payment version, as the correct version is needed for next step    | Get Payment By Id                                                                    |
| 4    | Capture the order                                                                                   | CaptureOrder                                                                         |

### Card payment

| Step | Description                                                                                         | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with card as payment source                                                         | createPayPalOrder                                                                    |
| 2    | In your browser open the link with the "rel" approve in create order response and approve the order | -                                                                                    |
| 3    | Get payment by id, to update the payment version, as the correct version is needed for next step    | Get Payment By Id                                                                    |
| 4    | Capture the order                                                                                   | CaptureOrder                                                                         |

## Standard flow

In this section we describe the flow that is used at our [demo website](https://poc-mediaopt2.frontend.site/) where the PayPal client is integrated into CoFe and the connector is installed at the merchant center. It is important to note that the CoFe project structure involves two separate parts - frontend and backend and [our integration](https://github.com/mediaopt/paypal-commercetools-cofe-integration/tree/main/packages/poc) involves both of them. Frontend is responsible for a client side and backend for the server (see also [Architecture.pdf](../Architecture.pdf)).

In our integration the PayPal client components are imported at [CoFe frontend](https://github.com/mediaopt/paypal-commercetools-cofe-integration/tree/main/packages/poc/frontend) and the API required for proper communication between the components and commercetools HTTP API (and therefore the PayPal commercetools connector) is developed at the [CoFe backend](https://github.com/mediaopt/paypal-commercetools-cofe-integration/tree/main/packages/poc/backend).

The cart creation before the payment with PayPal begins and the checkout procedure after the PayPal payment is complete are created by standard CoFe methods and are out of scope of this documentation. To create the cart via HTTP API please see the [official commercetools documentation](https://docs.commercetools.com/api/).

Here we will describe the [checkout payment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx).

### Rendering payment buttons

| Step | performed at                                                                                                                                                                                                    | description                                                                                                                                                                                                                     |
|------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1    | CoFe frontend [formPayment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx)        | all necessary payment methods are imported from the package:<br>`import { PayPal, PayUponInvoice, CardFields, ApplePay, GooglePay } from 'paypal-commercetools-client/dist/esm';`                                               |
| 2    | CoFe frontend [actions](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/frontastic/actions/paypal/index.ts)                                                   | the getSettings is called. It actually uses [commercetools frontend api action](https://docs.commercetools.com/frontend-api/action) and addresses CoFe backend                                                                  |
| 3    | CoFe backend [SettingsController](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/backend/payment-paypal/actionControllers/SettingController.ts)                       | commercetools HTTP API is used to obtain PayPal settings (see also the [PayPal Postman collection](https://github.com/mediaopt/paypal-commercetools-connector/blob/main/docs/paypal.postman_collection.json) getSettings call). |
| 4    | CoFe frontend [formPayment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx)        | PayPal payment methods parameters ([described later](#Payment-methods-parameters)) are obtained as result of previous steps, including such things as allowed payment methods and configuration of the payment buttons.         |
| 5    | CoFe frontend [formPayment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx)        | the cart is obtained using built-in CoFe methods                                                                                                                                                                                |
| 6    | CoFe frontend [paypalCheckoutData](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/payPalCheckoutData.tsx) | in this helper file payment methods parameters are calculated based on the previously obtained settings and cart                                                                                                                |
| 7    | CoFe frontend [formPayment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx)        | relevant payment methods with corresponding settings are rendered                                                                                                                                                               |

the further steps are triggered by the user actions, like pressing the payment button.

### Payment methods parameters

For complete list of parameters please see the [PayPal client documentation](https://github.com/mediaopt/paypal-commercetools-client/blob/main/docs/CoFe-PayPal-client-integration.pdf). Here we will only describe the API parameters required for the demonstrated payment methods. In our implementation all mentioned urls trigger corresponding methods at the [PayPal controller CoFe backend](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/backend/payment-paypal/actionControllers/PayPalController.ts). Please follow the link for the code, here we only briefly mention the principle.

| Parameter                   | Required for functioning             | Description                                                                                                                                                                                                                                                                                                                                                                                                             |
|-----------------------------|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| createPaymentUrl            | all components                       | triggers **createPayment**. Within this method cart is fetched to check if a relevant PayPal payment already exists, if not the new PayPal type payment is created, returns [CreatePaymentResponse](https://github.com/mediaopt/paypal-commercetools-client/blob/main/src/types/index.ts)                                                                                                                               |
| getClientTokenUrl           | except PayPal payment buttons        | triggers **getClientToken**. Within this method the client token is obtained from the PayPal side and returned.                                                                                                                                                                                                                                                                                                         |
| createPayPalOrder           | all payments                         | triggers **createPayPalOrder**. Within this methods cart is fetched to obtain payment details and line items, than payment [custom fields](https://docs.commercetools.com/api/projects/custom-fields) are updated to trigger the connector (see also createPayPalOrder in Postman collection). [CreateOrderResponse](https://github.com/mediaopt/paypal-commercetools-client/blob/main/src/types/index.ts) is returned. |
| onApproveUrl                | all payments except Pay Upon Invoice | triggers **capturePayPalOrder**. Within this method if not provided in a call a relevant order id is obtained from card payment information and connector capturePayPalOrder is triggered (also by payment custom fields). Returns [OnApproveResponse](https://github.com/mediaopt/paypal-commercetools-client/blob/main/src/types/index.ts)                                                                            |
| authenticateThreeDSOrderUrl | payments with 3D secure              | triggers **authenticateThreeDSOrder**. Within this method the data passed through the client are parsed to identify if the 3D secure passed successfully. Returns returns an object with the liability_shift, enrollment_status, and authentication_status.                                                                                                                                                             |

### Payment method dependent flow

In most of the payment cases the first three steps are the same:

1. On rendering the button the createPaymentUrl is called to obtain/generate the relevant payment id.
2. If relevant getClientToken is called to obtain the client token at the PayPal side.
3. The button is then rendered by the client via PayPal JS SDK.

#### Pay Upon Invoice

1. After user completes the additional data required only for Pay Upon Invoice payment and confirms, the createPayPalOrder is triggered
2. as Pay Upon Invoice does not require immediate payment - we trigger a custom checkout process for pay upon invoice (with extra liability message)
3. after the user completes invoice payment on the RatePay side the webhook at the connector side is triggered to capture the order.

#### PayPal Buy Now

1. On click on the target button createPayPalOrderUrl is called
2. if createPayPalOrder call was successfully - the floating window with PayPal login or payment form is opened and the payment can proceed.
3. the user completes the payment on PayPal side and on success onApproveUrl is addressed and capturePayPalOrder is triggered
4. after successful capture, we trigger the standard checkout process on the frontend side

#### Card

1. After user completes the card data and confirms, the createPayPalOrder is triggered
2. if 3D secure is required - the floating window with 3D secure form is opened and user needs to confirm the payment
3. if 3D secure is required - authenticateThreeDSOrderUrl is called to authenticate the payment
4. if 3D secure is successful or not required - onApproveUrl is addressed and capturePayPalOrder is triggered
5. after successful capture, we trigger the standard checkout process on the frontend side
