
# Commercetools

# PayPal Commercetools API Postman collection

This Postman collection contains examples of requests and responses for most endpoints and commands of the PayPal extension for Commercetools. For every command the smallest possible payload is given. Please find optional fields in the related official documentation.

## Disclaimer

This is not the official PayPal documentation. Please see [here](https://developer.paypal.com/docs/online/) for a complete and approved documentation of PayPal.

## How to use

**:warning: Be aware that postman automatically synchronizes environment variables (including your API client credentials) to your workspace if logged in.** **Use this collection only for development purposes and non-production projects.**

To use this collection in Postman please perform the following steps:

1. Download and install the Postman Client
2. Import the paypal.postman_collection.json and [template.json](https://github.com/commercetools/commercetools-postman-collection/blob/master/api/template.json) in your Postman application
3. In the Merchant Center, create a new API Client and fill in the client credentials in your environment
4. Obtain an access token by sending the "Authorization/Obtain access token" request at the bottom of the request list. Now you can use all other endpoints
    

Feel free to clone and modify this collection to your needs.

To automate frequent tasks the collection automatically manages commonly required values and parameters such as resource ids, keys and versions in Postman environment variables for you.

Please see [http://docs.commercetools.com/](http://docs.commercetools.com/) for further information about the commercetools platform.


## Endpoints

* [Authorization](#authorization)
    1. [Obtain access token](#1-obtain-access-token)
    1. [Obtain access token through password flow](#2-obtain-access-token-through-password-flow)
    1. [Token for Anonymous Sessions](#3-token-for-anonymous-sessions)
    1. [Token Introspection](#4-token-introspection)
* [PayPal](#paypal)
    1. [CreateOrder](#1-createorder)
        * [PayUponInvoice](#i-example-request-payuponinvoice)
        * [PayPal](#ii-example-request-paypal)
        * [Venmo](#iii-example-request-venmo)
        * [Card](#iv-example-request-card)
        * [Google Pay](#iv-example-request-google-pay)
        * [Apple Pay](#iv-example-request-apple-pay)
    1. [getClientToken](#2-getclienttoken)
    1. [CaptureOrder](#3-captureorder)
    1. [CaptureAuthorization](#4-captureauthorization)
    1. [AuthorizeOrder](#5-authorizeorder)
    1. [GetOrder](#6-getorder)
    1. [GetCapture](#7-getcapture)
    1. [createTrackingInformation](#8-createtrackinginformation)
    1. [updateTrackingInformation](#9-updatetrackinginformation)
    1. [UpdateOrder](#10-updateorder)
    1. [SetCustomType For Payment](#11-setcustomtype-for-payment)
    1. [SetCustomType For Customer](#12-setcustomtype-for-customer)
    1. [GetSettings](#13-getsettings)
    1. [Refund](#14-refund)
    1. [Partial Refund](#15-partial-refund)
    1. [CreateVaultSetupToken](#16-createvaultsetuptoken)
        * [Card](#i-example-request-card)
        * [PayPal](#ii-example-request-paypal-1)
    1. [getUserIdToken](#17-getuseridtoken)
    1. [createPaymentToken](#18-createpaymenttoken)
    1. [getPaymentTokens](#19-getpaymenttokens)
    1. [deletePaymentToken](#20-deletepaymenttoken)

--------



## Authorization

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

Provide the payment source in the request.

Additional fields might be relevant for certain payment methods (e.g. PayUponInvoice).


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
            "value" : "{\"storeInVaultOnSuccess\": true, \"paymentSource\":{\"card\":{}}}"
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
            "value" : "{\"payment_source\":{\"apple_pay\":{}}}"
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


Capture an order. The Order Id will be read from the payment object.


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

The authorization id will be read from the payment transactions.


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


### 5. AuthorizeOrder


Authorize an order.

The order id will be read from the payment object.


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

### 6. GetOrder


Get Order details.

The order id will be read from the payment object.


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

### 7. GetCapture


Get Capture details.

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

### 8. createTrackingInformation


Create Tracking Data for Payment.

The order id will be read from the payment object and the capture_id will be used from the transactions.

Please provide a tracking_number, carrier and optionally a carrier_name_other.


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

### 9. updateTrackingInformation


Update Tracking Data for Payment.

The order id will be read from the payment object and the capture_id will be used from the transactions.

Please provide a tracking_number, carrier and optionally a carrier_name_other.


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

### 10. UpdateOrder


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

### 11. SetCustomType For Payment


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

### 12. SetCustomType For Customer


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

### 13. GetSettings


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

### 14. Refund


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

### 15. Partial Refund


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

### 16. CreateVaultSetupToken


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



### 17. getUserIdToken


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


### 18. createPaymentToken


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

### 19. getPaymentTokens


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

### 20. deletePaymentToken


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
