
# Commercetools

# PayPal Commercetools API Postman collection

This Postman collection contains examples of requests and responses for most endpoints and commands of the PayPal extension for Commercetools. The extension provides communication to PayPal based on commercetools infrastructure, so if relevant the relation between PayPal and commercetools entities is mentioned.

For every command the smallest possible payload is given. Please find optional fields in the related official documentation.

If relevant mapping between commercetools entities and PayPal entities is mentioned.

## Disclaimer

This is not the official PayPal or commercetools documentation. Please see [here](https://developer.paypal.com/docs/online/) for a complete and approved documentation of PayPal and [here](https://docs.commercetools.com/docs/) for commercetools.

## How to use

**:warning: Be aware that postman automatically synchronizes environment variables (including your API client credentials) to your workspace if logged in.** **Use this collection only for development purposes and non-production projects.**
A running connector instance is required to utilize the communication between commercetools and PayPal.


To use this collection in Postman please perform the following steps:

1. Download and install the Postman Client
2. Import the paypal.postman_collection.json and [template.json](https://github.com/commercetools/commercetools-postman-collection/blob/master/api/template.json) in your Postman application
3. In the Merchant Center, create a new API Client and fill in the client credentials in your environment
4. Obtain an access token by sending the "Authorization/Obtain access token" request at the bottom of the request list. Now you can use all other endpoints
    

Feel free to clone and modify this collection to your needs.

To automate frequent tasks the collection automatically manages commonly required values and parameters such as resource ids, keys and versions in Postman environment variables for you.

Please see [http://docs.commercetools.com/](http://docs.commercetools.com/) for further information about the commercetools platform.

## General Workflow

The connector is accessed through [commercetools custom fields](https://docs.commercetools.com/api/projects/custom-fields#customfields). Therefore, all calls that trigger the connector include an object of the following structure:

```json
{
  "action": "setCustomField",
  "name": **connector method that will be triggered**,
  "value": **actual body with which the connector will be triggered**
}
```

The request is first sent to a commercetools relevant endpoint (e.g. payments) and the connector is triggered. The connector then processes the request and if relevant interacts with PayPal api based on request data and data available from commercetools. The response is then processed by the connector and relevant commercetools objects are updated accordingly. By default, the update just stores relevant fields from PayPal response in the custom field of the related object.

## Endpoints

- [Authorization](#authorization)
  1. [Obtain access token](#1-obtain-access-token)
  2. [Obtain access token through password flow](#2-obtain-access-token-through-password-flow)
  3. [Token for Anonymous Sessions](#3-token-for-anonymous-sessions)
  4. [Token Introspection](#4-token-introspection)
- [PayPal](#paypal)
  1. [CreateOrder](#1-createorder)
     - [PayUponInvoice](#i-example-request-payuponinvoice)
     - [PayPal](#ii-example-request-paypal)
     - [Venmo](#iii-example-request-venmo)
     - [Card](#iv-example-request-card)
     - [Google Pay](#v-example-request-google-pay)
     - [Apple Pay](#vi-example-request-apple-pay)
  2. [getClientToken](#2-getclienttoken)
  3. [CaptureOrder](#3-captureorder)
  4. [CaptureAuthorization](#4-captureauthorization)
  5. [VoidAuthorization](#5-voidauthorization)
  6. [AuthorizeOrder](#5-authorizeorder)
  7. [GetOrder](#6-getorder)
  8. [GetCapture](#7-getcapture)
  9. [createTrackingInformation](#8-createtrackinginformation)
  10. [updateTrackingInformation](#9-updatetrackinginformation)
  11. [UpdateOrder](#10-updateorder)
  12. [SetCustomType For Payment](#11-setcustomtype-for-payment)
  13. [SetCustomType For Customer](#12-setcustomtype-for-customer)
  14. [GetSettings](#13-getsettings)
  15. [Refund](#14-refund)
  16. [Partial Refund](#15-partial-refund)
  17. [CreateVaultSetupToken](#16-createvaultsetuptoken)
      - [Card](#i-example-request-card)
      - [PayPal](#ii-example-request-paypal-1)
  18. [getUserIdToken](#17-getuseridtoken)
  19. [createPaymentToken](#18-createpaymenttoken)
  20. [getPaymentTokens](#19-getpaymenttokens)
  21. [deletePaymentToken](#20-deletepaymenttoken)



## Authorization

All the calls in this section are only relevant for commercetools. Autentication for communication with PayPal is covered in the next section.

### 1. Obtain access token


Use this request to obtain an access token for your commercetools platform project via Client Credentials Flow. As a prerequisite you must have filled out environment variables in Postman for projectKey, client_id and client_secret to use this.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{auth_url}}/oauth/token
```



***Query params:***

| Key | Value |
| --- | ------|
| grant_type | client_credentials |

***🔑 Authentication basic***

| Key      | Value             |
|----------|-------------------|
| username | {{client_id}}     |
| password | {{client_secret}} |

<br>

### 2. Obtain access token through password flow


Use this request to obtain an access token for your commercetools platform project via Password Flow. As a prerequisite you must have filled out environment variables in Postman for projectKey, client_id, client_secret, user_email and user_password to use this.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{auth_url}}/oauth/{{project-key}}/customers/token
```



***Query params:***

| Key | Value | 
| --- | ------|
| grant_type | password |  
| username |  |  
| password |  |  

***🔑 Authentication basic***

| Key      | Value             |
|----------|-------------------|
| username | {{client_id}}     |
| password | {{client_secret}} |

<br>


### 3. Token for Anonymous Sessions


Use this request to obtain an access token for a anonymous session. As a prerequisite you must have filled out environment variables in Postman for projectKey, client_id and client_secret to use this.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{auth_url}}/oauth/{{project-key}}/anonymous/token
```



***Query params:***

| Key | Value | 
| --- | ------|
| grant_type | client_credentials |  

***🔑 Authentication basic***

| Key      | Value             |
|----------|-------------------|
| username | {{client_id}}     |
| password | {{client_secret}} |

<br>

### 4. Token Introspection


Token introspection allows to determine the active state of an OAuth 2.0 access token and to determine meta-information about this accces token, such as the `scope`.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{auth_url}}/oauth/introspect
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Query params:***

| Key | Value |
| --- | ------|
| token | {{ctp_access_token}} |

***🔑 Authentication basic***

| Key      | Value             |
|----------|-------------------|
| username | {{client_id}}     |
| password | {{client_secret}} |

<br>


## PayPal

### 1. CreateOrder


Create a PayPal Order.

Payment source is the only required parameter in the request. For each supported payment method the example call with a valid payment_source is provided.

Additional fields might be relevant for certain payment methods (e.g. PayUponInvoice).

If the request is correct - the PayPal endpoint [Create Order](https://developer.paypal.com/docs/api/orders/v2/#orders_create) will be called .

#### Connector workflow

1. The connector receives a request that includes:
   - payment_source (mandatory) - the payment source object, it must contain the method name and the necessary data, that can't be retrieved from commercetools cart or payment.
   - clientMetadataId (ony for PayUponInvoice) - see details in the [PayPal documentation](https://developer.paypal.com/docs/checkout/apm/pay-upon-invoice/fraudnet/)
   - custom_invoice_id (optional) - will be passed to PayPal as purchase_units.invoice_id if sent
   - storeInVaultOnSuccess (optional) - will trigger the connector to store the payment source in the vault if the payment source is "paypal", "venmo" or "card"
   - any other data that match [PayPal Order body specification](https://developer.paypal.com/docs/api/orders/v2/#orders_create). **In this case no mapping from commercetools will be available.**
2. The connector creates a request to PayPal orders api, in which includes all relevant fields from the previous step and provides the mapping for other fields, namely:
   - purchase_units: will be set based on commercetools cart and commercetools payment unless other value is sent in the request. **Note**: the whole purchase_units array will be overwritten in this case. The following parameters are mapped by default:
     - description - if possible will be retrieved from commercetools PayPal settings, if not based on cart
     - invoice_id - custom_invoice_id if sent in the request, otherwise commercetools payment id
     - items - will be sent only if the commercetools payment amountPlanned matches the commercetools cart totalPrice
     - amount:
         - currency_code
         - value 
         - breakdown - will be sent only if the commercetools payment amountPlanned matches the commercetools cart totalPrice
     - shipping - only if commercetools cart shipping address is provided
   - intent - "CAPTURE" for PayUponInvoice, for other methods the value specified in commercetools PayPal settings in the Merchant Center. If it is not specified - "CAPTURE"
   - processing_instruction - only for PayUponInvoice, the value is "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"
   - payment_source - if relevant for the method the value will be updated to include the necessary fields, namely:
     * for PayUponInvoice - birth_date and phone must be provided in the request, if other parameters are not provided - they will be defined based on commercetools cart and PayPal settings
     * if commercetools shipping address is provided - experience_context.shipping_preference will be set to 'SET_PROVIDED_ADDRESS', unless different value is sent in the request
3. If storeInVaultOnSuccess was requested and payment source is "paypal", "vemno" or "card" the connector will attempt to retrieve the commercetools user PayPalUserId and will add to the request body the fields necessary for vaulting the relevant method.
4. The connector sends the request to PayPal and on success updates the commercetools payment.

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{}"
          }
    ]
}
```
***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>


***More example Requests/Responses:***


#### I. Example Request: PayUponInvoice


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"clientMetadataId\": \"12345678901234567890123456789012\", \"payment_source\": {\"pay_upon_invoice\":{\"birth_date\": \"1990-01-01\", \"phone\": {\"national_number\": \"6912345678\", \"country_code\": \"49\"}}}}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>



#### II. Example Request: PayPal


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"payment_source\":{\"paypal\":{\"experience_context\": {\"return_url\": \"https://example.com/returnUrl\",\"cancel_url\": \"https://example.com/cancelUrl\"}}}}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>



#### III. Example Request: Venmo


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"payment_source\":{\"venmo\":{}}}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>



#### IV. Example Request: Card


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"storeInVaultOnSuccess\": true, \"paymentSource\":{\"card\":{\"experience_context\": {\"return_url\": \"https://example.com/returnUrl\",\"cancel_url\": \"https://example.com/cancelUrl\"}}}}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>

#### V. Example Request: Google Pay


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"payment_source\":{\"google_pay\":{}}}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>

#### VI. Example Request: Apple Pay


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPayPalOrderRequest",
            "value" : "{\"payment_source\":{\"apple_pay\":{\"experience_context\": {\"return_url\": \"https://example.com/returnUrl\",\"cancel_url\": \"https://example.com/cancelUrl\"}}}}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>

### 2. getClientToken


Get Client Token.

Returns a string which contains all authorization and configuration  
information that your client needs to initialize the client SDK to  
communicate with PayPal.

#### Connector workflow
1. The connector attempts to retrieve cached commercetools PayPal access token.
2. If the cached token is not available a new token is generated.
3. [PayPal Authentication](https://developer.paypal.com/api/rest/authentication/) is triggered.
4. On success updates the commercetools payment object.

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "getClientTokenRequest",
            "value" : "{}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 3. CaptureOrder

Capture an order. If not provided the Order Id will be read from the payment object.

#### Connector workflow
1. The connector receives the request that includes:
   - orderId(optional) - the order id to be captured. 
   - any other data that match [PayPal Capture Order body specification](https://developer.paypal.com/docs/api/orders/v2/#orders_capture). 
2. If not provided in the request the order_id will be read from the payment object and PayPal api Captrure Order will be triggered with the id and any other passed data.
3. The connector updates commercetools payment object and adds a transaction to it. Transaction data depend on the PayPal response.

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "capturePayPalOrderRequest",
            "value" : "{}"
          }
    ]
}
```


***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 4. CaptureAuthorization


Capture an authorization.

If not provided the authorization id will be read from the payment transactions.

#### Connector Workflow
1. The connector receives the request that includes:
   - authorizationId(optional) - the authorization id to be captured.
   - any other data that match [PayPal Capture authorized payment body specification](https://developer.paypal.com/docs/api/payments/v2/#authorizations_capture).
2. If not provided in the request the authorization_id will be read from the payment transactions and PayPal api Capture Authorization will be triggered with the id and any other passed data.
3. The connector updates commercetools payment object and adds a transaction to it. Transaction data depend on the PayPal response.

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |


***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "capturePayPalAuthorizationRequest",
            "value" : "{}"
          }
    ]
}
```
***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 5. VoidAuthorization


Void an authorization.

If not provided authorization id will be read from the payment transactions.

#### Connector Workflow
1. The connector receives the request that includes:
    - authorizationId(optional) - the authorization id to be captured.
2. If not provided in the request the authorization_id will be read from the payment transactions and [PayPal api](https://developer.paypal.com/docs/api/payments/v2/#authorizations_void) will be triggered with the id.
3. The connector updates commercetools payment object and adds a transaction to it. Transaction data depend on the PayPal response.


**_Endpoint:_**

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


**_Headers:_**

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |


**_Body:_**

```js
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "voidPayPalAuthorizationRequest",
            "value" : "{}"
          }
    ]
}
```

**_🔑 Authentication oauth2_**

| Key         | Value                |
| ----------- | -------------------- |
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 6. AuthorizeOrder

Authorize an order.

If not provided the order id will be read from the payment object.

#### Connector Workflow
1. The connector receives the request that includes:
    - orderId(optional) - the order id to be captured.
    - any other data that match [PayPal Authorize order body specification](https://developer.paypal.com/docs/api/orders/v2/#orders_authorize).
2. If not provided in the request the order_id will be read from the payment and PayPal api authorize order will be triggered with the id and any other passed data.
3. The connector updates commercetools payment object and adds a transaction to it. Transaction data depend on the PayPal response.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "authorizePayPalOrderRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 7. GetOrder


Get Order details.

If not provided the order id will be read from the payment object.

#### Connector Workflow
1. The connector receives the request that includes:
    - orderId(optional) - the order id to be retrieved.
2. If not provided in the request the order_id will be read from the payment and PayPal api authorize order will be triggered with the id and any other passed data.
3. The connector updates commercetools payment object.

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "getPayPalOrderRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 8. GetCapture


Get Capture details.

The payment needs at least one capture transaction. If there are multiple transactions and no specific captureId is provided, the newest one will be refunded.

#### Connector Workflow
1. The connector receives the request that includes:
    - captureId(optional) - the order id to be retrieved.
2. If not provided in the request the order_id will be read from the payment and PayPal api authorize order will be triggered with the id and any other passed data.
3. The connector updates commercetools payment object.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "getPayPalCaptureRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 9. createTrackingInformation


Create Tracking Data for Payment.

The order id will be read from the payment object and the capture_id will be used from the transactions.

Please provide a tracking_number, carrier and optionally a carrier_name_other.  
Custom items can be submitted at your own responsibility.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createTrackingInformationRequest",
            "value" : "{\"tracking_number\":\"ABCDE\", \"carrier\":\"OTHER\",\"carrier_name_other\":\"New Carrier\"}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 10. updateTrackingInformation


Update Tracking Data for Payment.

The order id will be read from the payment object and the capture_id will be used from the transactions.

Please provide a tracking_number and patch variable, that lists all required update operations according to [PayPal format](https://developer.paypal.com/docs/api/orders/v2/#orders_trackers_patch).


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "updateTrackingInformationRequest",
            "value" : "{\"trackingId\": \"7ED57114A9758913N-ABCDE\", \"patch\":[{\"op\": \"replace\",\"path\": \"/notify_payer\", \"value\": true}]}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 11. UpdateOrder


Update an order.

The order id will be read from the payment object.

This endpoint is needed in the express checkout flow if the amount planned changes.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "updatePayPalOrderRequest",
            "value" : "{\"orderId\":\"4CW85179BD877004V\", \"patch\":[{\"op\": \"replace\",\"path\": \"/purchase_units/@reference_id=='default'/amount\",\"value\": {\"currency_code\": \"EUR\",\"value\": \"130.00\"}}]}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 12. SetCustomType For Payment


Set the custom type of a payment to paypal-payment-type so that custom fields like createOrderRequest can be set.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomType",
            "type" : {
              "key" : "paypal-payment-type",
              "typeId" : "type"
            }
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 13. SetCustomType For Customer


Set the custom type of a payment to paypal-customer-type so that custom fields like CreateVaultSetupTokenRequest can be set.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomType",
            "type" : {
              "key" : "paypal-customer-type",
              "typeId" : "type"
            }
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 14. GetSettings


Get CustomObject for the PayPal settings.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{host}}/{{project-key}}/custom-objects/paypal-commercetools-connector/settings
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 15. Refund


Refund a captured order.

If you do not specify an amount to refund, the remaining order amount will be refunded.

The payment needs at least one capture transaction. If there are multiple transactions, the newest one will be refunded.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "refundPayPalOrderRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 16. Partial Refund


Refund a captured order.

The payment needs at least one capture transaction. If there are multiple transactions, the newest one will be refunded.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/payments/{{payment-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{payment-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "refundPayPalOrderRequest",
            "value" : "{\"amount\": 2}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 17. CreateVaultSetupToken


Create a Vault Setup Toklen for the customer. This token is needed for vaulting payment methods.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createVaultSetupTokenRequest",
            "value" : "{\"payment_source\":{\"card\": {}}}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

***More example Requests/Responses:***


#### I. Example Request: Card


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createVaultSetupTokenRequest",
            "value" : "{\"payment_source\":{\"card\": {}}}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

***Status Code:*** 0

<br>



#### II. Example Request: PayPal


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createVaultSetupTokenRequest",
            "value" : "{\"payment_source\":{\"paypal\": {\"usage_type\": \"MERCHANT\",\"experience_context\": {\"return_url\": \"https://example.com/returnUrl\",\"cancel_url\": \"https://example.com/cancelUrl\"}}}}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |


***Status Code:*** 0

<br>



### 18. getUserIdToken


Get a User Id Token for the customer.

This token is needed for vaulting payment methods.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "getUserIDTokenRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>


### 19. createPaymentToken


Create a payment token for the customer.

The input is a token which was generated in the frontend.

This endpoint is used for vaulting payment methods.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "createPaymentTokenRequest",
            "value" : "ABCDE"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 20. getPaymentTokens


Get the current list of vaulted payment methods for the customer.

The list can be displayed in the frontend to reuse those payment methods.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value |
| --- | ------|
| Content-Type | application/json |  



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "getPaymentTokensRequest",
            "value" : "{}"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |

<br>

### 21. deletePaymentToken


Delete a saved payment token.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{host}}/{{project-key}}/customers/{{customer-id}}
```


***Headers:***

| Key | Value | 
| --- | ------|
| Content-Type | application/json | 



***Body:***

```js        
{
    "version": {{customer-version}},
    "actions": [
        {
            "action" : "setCustomField",
            "name" : "deletePaymentTokenRequest",
            "value" : "THEPAYMENTTOKEN"
          }
    ]
}
```

***🔑 Authentication oauth2***

| Key         | Value                |
|-------------|----------------------|
| accessToken | {{ctp_access_token}} |
| addTokenTo  | header               |
| tokenType   | Bearer               |


---
[Back to top](#commercetools)
