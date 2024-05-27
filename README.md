<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a><br/>
    <a href="https://www.paypal.com/de/business/accept-payments">
    <img alt="PayPal logo" src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-200px.png">
  </a><br>

This is a <a href="https://marketplace.commercetools.com/">connect application</a> to integrate PayPal into Commercetools. It follows the folder structure to ensure certification & deployment from commercetools connect team as stated <a href="https://github.com/commercetools/connect-application-kit#readme"> here </a>.

</p>

## Instructions

- `cd paypal-commercetools-extension` or `cd paypal-commercetools-events`
- run `yarn` to install the dependencies
- insert commercetools and PayPal credentials to `.env` file
- run `./bin/ngrok.sh` or `ngrok http 8080` to start ngrok and insert the dynamic url in the `.env` file as specified in post-deploy script
- run `yarn connector:post-deploy` to register the extension with the public ngrok url
- run `ỳarn start:dev` to build the application
