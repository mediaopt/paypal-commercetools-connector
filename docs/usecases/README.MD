<p style="text-align: center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a><br/>
    <a href="https://www.paypal.com/de/business/accept-payments">
    <img alt="PayPal logo" src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-200px.png">
  </a><br>
</p>

In this folder you can find the use cases for the PayPal commercetools connector. Here we summarize the actual workflow and the expected results. The simplified workflow that only includes backend calls through postman is also provided as a [workflow Postman Collection](PayPal-commercetools-workflow.postman_collection.json).

# Use Cases

## Installation

The connector itself is the backend part of the payment process, it is designed to be used together with the [PayPal client api](https://www.npmjs.com/package/paypal-commercetools-client) for the frontend integration. If it is not possible for some reason you are obliged to use [PayPal JS SDK](https://developer.paypal.com/sdk/js/) instead. We also use commercetools frontend (further referred as CoFe), but it is an optional part, shown here for illustration how to develop necessary API for the PayPal client.

### Connector installation

There are two possible ways to integrate the connector, both fully covered in the mentioned documentation.

1. Installed [directly from the commercetools marketplace](https://docs.commercetools.com/merchant-center/connect).
2. Create your own deployment using [commercetools connect API](https://docs.commercetools.com/connect/getting-started).

The connector includes a merchant center application, which is automatically installed and deployed when installing the connector, but it might be needed to update the custom application link after the deployment, as described in [commercetools documentation](https://docs.commercetools.com/merchant-center-customizations/deployment-examples/commercetools-connect).

### Frontend installation
The client can be directly installed to the shop frontend using npm:

```npm i paypal-commercetools-client```

and then the components imported directly from the package, see for example the [payment form in CoFe integration](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx).

## Payment Process

To start the payment process with the connector the preliminary prepared commercetools cart and payment is required. In our case we have used the CoFe frontend to create the cart and the payment, but the example process through the [commercetools HTTP API](https://docs.commercetools.com/api/) is also provided in Postman collection and can be separated to following steps:

### Backend only flow
The backend flow that we provide as a collection can be separated to three parts:
1. creating the cart and payment via standard commercetools HTTP api, which we provide only to get reliable example of the cart for all payments,
2. PayPal specific part, which includes setting the custom type for payment and obtaining the client token.
3. PayPal payment method specific part, that can differ for different payment methods

The first two categories are covered in the Postman collection Initial part, the third is provided separately for some methods in the corresponding subfolder of the Payment specific folder. To go through the whole payment process of a target method you need to follow first all the calls in initial folder in a Postman collection and then all the specific for this method. All the necessary data are already provided in the collection, so you can just run the requests and see the results.

### Initial flow
| Step | Description                                                                                                                                            | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1    | If not yet - [obtain commercetools access token](https://docs.commercetools.com/api/authorization).                                                    | getAccessToken                                                                       |
| 2    | [Create a cart](https://docs.commercetools.com/api/projects/carts) with some products in it. Products can be added during creation or added separately | Search for a product -> Create Cart -> AddLineItem                                   |
| 3    | [Create a payment](https://docs.commercetools.com/api/projects/payments) with the `paypal-payment-type`.                                               | SetCustomType For Payment                                                            |
| 4    | Link the payment to the cart                                                                                                                           | AddPayment                                                                           |
| 5    | If not yet - get client token for communication with PayPal                                                                                            | getClientToken                                                                       |

#### Payment method specific flow

MOST OF THE METHODS REQUIRES USER APPROVAL AFTER CREATE PAYPAL ORDER. IT MEANS THAT THE USER SHOULD APPROVE THE ORDER VIA THE LINK, PROVIDED IN THE RESPONSE.
In case if this is applicable for a certain method - it is mentioned in the method description. For sandbox testing sanbdox customer credentials or [sandbox testing cards provided in the PayPal documentation](https://developer.paypal.com/tools/sandbox/card-testing/) can be used to approve the order.

##### Pay Upon Invoice
Pay Upon invoice is the simplest as the payment is not processed immediately.

| Step | Description                                    | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with Invoice as payment source | createPayPalOrder                                                                    |

##### PayPal 
| Step | Description                                                                                         | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with PayPal as payment source                                                       | createPayPalOrder                                                                    |
| 2    | In your browser open the link with the "rel" approve in create order response and approve the order | -                                                                                    |
| 3    | Get payment by id, to update the payment version, as the correct version is needed for next step    | Get Payment By Id                                                                    |
| 4    | Capture the order                                                                                   | CaptureOrder                                                                         |

##### Card payment

| Step | Description                                                                                         | [Postman Collection](PayPal-commercetools-workflow.postman_collection.json) workflow |
|------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1    | Create an order with card as payment source                                                         | createPayPalOrder                                                                    |
| 2    | In your browser open the link with the "rel" approve in create order response and approve the order | -                                                                                    |
| 3    | Get payment by id, to update the payment version, as the correct version is needed for next step    | Get Payment By Id                                                                    |
| 4    | Capture the order                                                                                   | CaptureOrder                                                                         |

### Frontend flow
In case of frontend flow the PayPal client components are imported at CoFe frontend and the API required for proper communication between the components and commercetools HTTP API is developed at the [CoFe backend](https://github.com/mediaopt/paypal-commercetools-cofe-integration/tree/main/packages/poc/backend). The cart is created by CoFe and is out of scope of this documentation. To create the cart via only HTTP API please see the [official commercetools documentation](https://docs.commercetools.com/api/).

Here we will describe the [checkout payment](https://github.com/mediaopt/paypal-commercetools-cofe-integration/blob/main/packages/poc/frontend/components/commercetools-ui/checkout/checkout-form/fields/formPayment.tsx) starting from the point where connector is involved at the backend.

First the getSettings is called to obtain the information like which methods should actually be shown. For all available settings please see the paypal-payment-panel provided by custom application in the merchant center.
