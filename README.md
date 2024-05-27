<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a><br/>
    <a href="https://www.paypal.com/de/business/accept-payments">
    <img alt="PayPal logo" src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-200px.png">
  </a><br>
</p>

This is a [connect application](https://marketplace.commercetools.com/) to integrate PayPal payment methods and package tracking into Commercetools. It follows the folder structure to ensure certification & deployment from commercetools connect team as stated [here](https://github.com/commercetools/connect-application-kit#readme).

[PayPal commercetools connector](https://marketplace.commercetools.com/integration/paypal) is available in the commercetools marketplace.

The payments demo and integration to the commercetools frontend can be seen at https://poc-mediaopt2.frontend.site/  and [github](https://github.com/mediaopt/paypal-commercetools-cofe-integration).

## Prerequisites

To use the connector you need to have the following:

- commercetools Composable Commerce account and [API client](https://docs.commercetools.com/api/projects/api-clients#apiclient) credentials, namely:
  - region (CTP_REGION) - region, in which your commercetools project is hosted
  - project key (CTP_PROJECT_KEY) - the key of your commercetools project
  - client ID (CTP_CLIENT_ID) - the ID of your commercetools API client
  - client secret (CTP_CLIENT_SECRET) - the secret of your commercetools API client
  - scope (CTP_SCOPE) - the scope of your commercetools API client
- [PayPal business customer account](https://www.google.com/aclk?sa=l&ai=DChcSEwjPz82wyK2GAxWSiVAGHUwzAVoYABABGgJkZw&gclid=Cj0KCQjw3tCyBhDBARIsAEY0XNnOcx462M0ej3RizrdN9a_6fl2O5_bfwVqOOzyHxz_9M7L10B8NfL0aAgA6EALw_wcB&sig=AOD64_0bOBSNaFhCg-wypewofyWkrpoBWg&q&adurl&ved=2ahUKEwiIqcewyK2GAxXlSkEAHejBBbQQqyQoAHoECAIQDA) and [API client](https://developer.paypal.com/api/rest/#link-getclientidandclientsecret) credentials,namely:
  - client ID (PAYPAL_CLIENT_ID) - the ID of your PayPal API client
  - client secret (PAYPAL_CLIENT_SECRET) - the secret of your PayPal API client
  - environment (PAYPAL_ENVIRONMENT) - the environment of your PayPal API client (production or sandbox)

## Instructions

The connector can be installed [directly from the commercetools marketplace](https://docs.commercetools.com/merchant-center/connect).

To run the connector locally:

- `cd paypal-commercetools-extension` or `cd paypal-commercetools-events`
- run `yarn` to install the dependencies
- insert commercetools and PayPal credentials to `.env` file
- for paypal-commercetools-extension run `./bin/ngrok.sh` to start ngrok and insert the dynamic url in the `.env` file as specified in post-deploy script
- for paypal-commercetools-extension run `yarn connector:post-deploy` to register the extension with the public ngrok url
- run `ỳarn start:dev` to build the application

## Technology Stack

The connector is written in TypeScript and yarn is used as the package manager.

## Contributing

Feel free to contribute to the project by opening an issue.

## Additional information

In the docs folder you can find:

- description of each application included (README.md)
- architecture of the connector (Architecture.pdf)
- documented PayPal Commercetools API Postman collection (PayPal.md, paypal.postman_collection.json)
