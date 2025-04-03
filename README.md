![build](https://github.com/mediaopt/paypal-commercetools-connector/actions/workflows/build.yml/badge.svg)
![test](https://github.com/mediaopt/paypal-commercetools-connector/actions/workflows/test.yml/badge.svg)
![audit](https://github.com/mediaopt/paypal-commercetools-connector/actions/workflows/audit.yml/badge.svg)

## Waring: This branch is a feature dedicated for specific customer.

Only the methods relevant for the customer are tested and maintained. Other methods may be influenced by breaking changes, and **we don't provide any public support for the issues related to this brunch**.
If you want a feature branch for you or your customer, please contact us.

## Major differences to the original connector

If PayPal multitenant credentials are not provided the connector will operate as before. No actions are needed.

**For multi tenant mode:**

1. PayPal credentials must be provided for each store in form:
   PAYPAL_MULTI_TENANT_CLIENT_IDS:{"storeKey1":"clientId1","storeKey2":"clientId2",..."storeKeyN":"clientIdN"}
   PAYPAL_MULTI_TENANT_CLIENT_SECRETS:{"storeKey1":"clientSecret1","storeKey2":"clientSecret2",..."storeKeyN":"clientSecretN"}
2. If multi tenant credentials are provided PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET can be skipped. If they are provided they will be used as fallback for the payments that are not in store or are in the store, that is not covered in both multi tenant ids and secrets.
3. Each commercetools cart that should use custom PatPal credentials should be linked to a store. Payments will retrieve store key from cart automatically and save it as custom field if available. No further changes in payment process are required.
4. Vaulting and tracking in multi tenant mode are not supported, all changes to these methods are only for maintainability and are tested within the single tenant scope

<p style="text-align: center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a><br/>
    <a href="https://www.paypal.com/de/business/accept-payments">
    <img alt="PayPal logo" src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-200px.png">
  </a><br>
</p>

This is a [connect application](https://marketplace.commercetools.com/) to integrate PayPal payment methods and package tracking into Commercetools. It follows the folder structure to ensure certification & deployment from commercetools connect team as stated [here](https://github.com/commercetools/connect-application-kit#readme).

[PayPal commercetools connector](https://marketplace.commercetools.com/integration/paypal) is available in the commercetools marketplace.

The payments demo can be seen at https://poc-mediaopt2.frontend.site/.

## Integration

The connector is supposed to be used together with the PayPal client app. The client is available at [npm](https://www.npmjs.com/package/paypal-commercetools-client) and [github](https://github.com/mediaopt/paypal-commercetools-client). The connector is responsible for the backend integration with commercetools and PayPal, while the client is responsible for the frontend. If for some reasons the PayPal client app can't be used, the [PayPal JS SDK](https://developer.paypal.com/sdk/js/) should be used instead. The example of the integration with commercetools frontend is covered in [docs/usecases/README.md](docs/workflows/README.md) and the code can be seen in [github](https://github.com/mediaopt/paypal-commercetools-cofe-integration).

## Prerequisites

To use the connector you need to have the following:

- commercetools Composable Commerce account and [API client](https://docs.commercetools.com/api/projects/api-clients#apiclient) credentials, namely:

| credential    | environmental variable | description                                           |
| ------------- | ---------------------- | ----------------------------------------------------- |
| region        | CTP_REGION             | region, in which your commercetools project is hosted |
| project key   | CTP_PROJECT_KEY        | the key of your commercetools project                 |
| client ID     | CTP_CLIENT_ID          | the ID of your commercetools API client               |
| client secret | CTP_CLIENT_SECRET      | the secret of your commercetools API client           |
| scope         | CTP_SCOPE              | the scope of your commercetools API client            |

- [PayPal business customer account](https://www.paypal.com/de/business/getting-started) and [API client](https://developer.paypal.com/api/rest/#link-getclientidandclientsecret) credentials,namely:

| credential    | environmental variable | description                                                       |
| ------------- | ---------------------- | ----------------------------------------------------------------- |
| client ID     | PAYPAL_CLIENT_ID       | the ID of your PayPal API client                                  |
| client secret | PAYPAL_CLIENT_SECRET   | the secret of your PayPal API client                              |
| environment   | PAYPAL_ENVIRONMENT     | the environment of your PayPal API client (production or sandbox) |

Optionally for sending PayPal Pay Upon Invoice custom emails please provide SMTP credentials:

- SMTP_HOST
- SMTP_PORT
- SMTP_USERNAME
- SMTP_SENDER
- SMTP_PASSWORD

## Instructions

### Deployment through commercetools

The connector can be installed [directly from the commercetools marketplace](https://docs.commercetools.com/merchant-center/connect) or deployed from github repository via [commercetools Connect API](https://docs.commercetools.com/connect/).

### Local running

To run the connector locally for test purposes:

- `cd paypal-commercetools-extension` or `cd paypal-commercetools-events`
- run `yarn` to install the dependencies
- insert commercetools and PayPal credentials to `.env` file
- for paypal-commercetools-extension run `./bin/ngrok.sh` to start ngrok and insert the dynamic url in the `.env` file as specified in post-deploy script
- for paypal-commercetools-extension run `yarn connector:post-deploy` to register the extension with the public ngrok url
- run `ỳarn start:dev` to build the application

### Hosting externally

Please set your application url (see the example in [ngrok.sh](./paypal-commercetools-extension/bin/ngrok.sh)) in the `.env` file and run post-deploy script. The url should be accessible externally.

## Technology Stack

The connector is written in TypeScript and yarn is used as the package manager.

## Contributing

Feel free to contribute to the project by opening an issue.

## Additional information

In the docs folder you can find:

- description of each application included (README.md)
- architecture of the connector (Architecture.pdf)
- documented PayPal Commercetools API Postman collection (PayPal.md, paypal.postman_collection.json)
- workflows folder with examples how to use the connector individually or together with PayPal client and commercetools frontend
