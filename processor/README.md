# processor

Backend-for-frontend of the PayPal commercetools connector for commercetools Checkout, based on [commercetools Connect](https://docs.commercetools.com/connect). It is triggered by HTTP requests from the `enabler` (the Checkout UI): it fetches the corresponding cart and payment from commercetools, calls PayPal and syncs the result back to the commercetools payment.

The processor is not meant to be called by merchants directly. The only merchant-facing entry point is the [Payment Intents API](https://docs.commercetools.com/checkout/payment-intents-api), called on commercetools' own Checkout host, which forwards to this module (see the root [README.md](../README.md#checkout-mode-installation-and-configuration)).

The module also provides the post-deploy and pre-undeploy scripts run by commercetools Connect.

## Getting started

Run the following commands in the `processor` folder. For running the processor together with the enabler and a JWT mock server, see the root [README.md](../README.md#checkout-mode) (`docker compose up`).

| Command                                                   | Purpose                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm install`                                             | install dependencies                                               |
| `npm run build`                                           | build `common-connect` and the processor (output in `dist`)        |
| `npm run test`                                            | build and run the automated tests                                  |
| `npm run dev`                                             | run from source (`ts-node`)                                        |
| `npm run watch`                                           | run from source and restart on changes (used by docker compose)    |
| `npm run start`                                           | run the built application (`dist`)                                 |
| `npm run lint` / `npm run lint:fix`                       | verify / fix the code style                                        |
| `npm run connector:post-deploy` / `connector:pre-undeploy` | run the Connect deployment scripts locally (requires `npm run build`) |

`dev` and `watch` don't build `common-connect` — build it once beforehand (`npm run build`, or `npm install && npm run build` in `common-connect`).

## Configuration

Copy `.env.template` to `.env` and fill in the values; `.env.template` documents every variable, including the JSON ones. `CTP_REGION` and `CTP_SCOPE` are required in addition to the full commercetools URLs, since `common-connect` builds its own commercetools client from them.

The commercetools API client needs at least the following scopes (the health check, `GET /operations/status`, fails otherwise):

- `manage_payments`
- `view_sessions`
- `view_api_clients`
- `manage_orders`
- `introspect_oauth_tokens`
- `manage_checkout_payment_intents`
- `manage_types`
- `manage_payment_methods` — only if `STORED_PAYMENT_METHODS_ENABLED=true`

## Endpoints

| Endpoint                                   | Authentication                                           | Purpose                                              |
| ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| `GET /operations/config`                   | session                                                  | settings, PayPal client id and script options for the enabler |
| `GET /operations/status`                   | JWT                                                      | health check                                         |
| `GET /operations/payment-components`       | JWT                                                      | payment methods supported by the connector           |
| `POST /operations/payment-intents/:id`     | OAuth2 (`manage_project`, `manage_checkout_payment_intents`) | Payment Intents API: capture, cancel, refund         |
| `POST /payments`                           | session                                                  | create the commercetools payment for the session cart |
| `POST /payments/createOrder`               | session                                                  | create the PayPal order                              |
| `POST /payments/approve`                   | session                                                  | capture an approved PayPal order                     |
| `POST /payments/authorize`                 | session                                                  | authorize an approved PayPal order                   |
| `POST /payments/expressApprove`            | session                                                  | PayPal Express legal-review redirect on approval     |
| `POST /payments/3ds`                       | session                                                  | 3DS authentication result for credit cards           |
| `POST /payments/updateShipping`            | session                                                  | PayPal Express shipping change                       |
| `GET /stored-payment-methods`              | session                                                  | the customer's stored credit cards                   |
| `DELETE /stored-payment-methods/:id`       | session                                                  | remove the cart customer's stored credit card        |

## Authentication

- `oauth2`: relies on the commercetools OAuth2 server
- `session`: relies on the commercetools session service
- `jwt`: relies on the JWT injected by the Merchant Center via the forward-to proxy

For local authentication (OAuth2 token, session, JWT), see the commercetools [connect-payment-integration-template](https://github.com/commercetools/connect-payment-integration-template).

Send the session id as the `x-session-id` header to the session-protected endpoints. The enabler development page (`enabler/dev-utils/session.js`) does this automatically.
