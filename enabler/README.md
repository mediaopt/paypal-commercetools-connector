# enabler

Frontend payment components for the PayPal commercetools connector, built against the
commercetools Checkout `enabler`/`processor` pattern.

## Background

This package started as the standalone
[`paypal-commercetools-client`](https://www.npmjs.com/package/paypal-commercetools-client) npm
package. **That package is discontinued** — it is no longer published or maintained. Its
components (PayPal buttons, credit-card fields, the stored-payment-method list, Pay Upon Invoice,
etc.) have been ported directly into this repository's own source instead of being pulled in as an
npm dependency.

The package entry (`src/main.ts`) exports only the Checkout `Enabler`. Self-hosting merchants use
the components from source (`src/components`).

## What this package is for

The primary purpose of `enabler` today is to be the frontend half of a commercetools **Checkout**
connector: a component library that mounts inside commercetools Checkout via the standard
`enabler`/`processor` pattern.

We provide **limited backward compatibility** with the discontinued npm client by keeping its
component code and props working: a merchant who already used the npm client with their own BFF can
self-host these components outside commercetools Checkout (_legacy mode_). Self-hosting is not the
focus of ongoing development — new work targets the Checkout integration. If you are interested in
the standalone option, please open an issue.

**Self-hosting means implementing every backend-for-frontend (BFF) endpoint yourself** — not just
providing the URLs, but the request/response shape, auth and error handling behind each one
(`src/components/constants.ts`).

## Checkout mode is intentionally limited

When these components are mounted inside commercetools Checkout, their functionality is
deliberately scoped down to match what commercetools Checkout itself supports. Not everything the
standalone client could do carries over.

**If you need functionality that existed in the standalone client but isn't available in Checkout
mode, please open an issue**.

## Principal differences in Checkout mode

**The core operational difference:** in legacy mode each component is rendered individually, so
each can load its own PayPal JS SDK script with its own parameters. In Checkout mode all components
are preloaded at the same time, so they must all share one identical script (see
[script options](#paypal-js-sdk-script-options-currency-funding-sources-etc)).

This list highlights the most consequential differences — it isn't exhaustive.

1. **No "vault only" flow.** Saving a payment method with no accompanying payment isn't supported.
   Checkout only supports paying, optionally _with_ vaulting the card used for that payment at the
   same time.
2. **Purchase-and-vault is credit-card only.** Paying and saving the payment method in the same
   transaction is not available for other payment sources (PayPal, Apple Pay, etc.).
3. **Only stored credit cards, not PayPal/Venmo accounts.** A previously-saved PayPal or Venmo
   account is not offered as a stored payment method in Checkout mode.
4. **Form-based components submit and validate through Checkout, not their own button.**
   Credit Card (`CardFields`) and Pay Upon Invoice no longer render their own "Pay" button when
   mounted in Checkout. Checkout renders the button and drives each component's submission and
   validation itself. See [`onRegisterSubmit`](#onregistersubmit--onregistervalidation) below.
5. **`onError` is Checkout-only** — see [Error reporting](#error-reporting-onerror).

## Checkout setup and lifecycle

`PayPalPaymentEnabler._Setup()` (`src/payment-enabler/payment-enabler-paypal.ts`) runs once per
checkout page, in parallel:

- fetches `GET {processorUrl}/operations/config` (settings, client id, script options),
- creates one commercetools Payment for the session cart, shared by every mounted component,
- preloads the PayPal JS SDK (`src/app/preloadPayPalScript.ts`).

Any failure here is fatal for the enabler.

After a successful payment the processor redirects the buyer to a result page (see
[Buyer redirect](#buyer-redirect-after-approval-merchantreturnurl)). Only if no result url is
configured — neither in the Merchant Center Checkout application nor as the processor's
`MERCHANT_RETURN_URL` fallback — does the enabler call:

1. `purchaseCallback` — a legacy-mode prop, not intended for Checkout. In Checkout mode it only logs
   the result, and only for components that supported it; use it for testing only.
2. else Checkout's `onComplete`,
3. else it only logs a warning.

In legacy mode there is no shared Payment: each component calls `createPaymentUrl` itself.

## Component props

### Endpoint URLs and `processorUrl`

The standalone client configured each component with individually-named endpoint URLs, each
pointing at a self-hosted backend route. **These props are still fully supported and not
deprecated** (only `removePaymentTokenUrl` is). `createPaymentUrl` is the only required one; the
others silently do nothing when missing, as before.

In Checkout mode `RenderTemplate` fills the same props from `processorUrl` using `processorUrls()`
(`src/components/constants.ts`), after stripping a trailing slash:

```ts
processorUrls(processorUrl) => ({
  createPaymentUrl: `${processorUrl}/payments`,
  onApproveUrl: `${processorUrl}/payments/approve`,
  createOrderUrl: `${processorUrl}/payments/createOrder`,
  authorizeOrderUrl: `${processorUrl}/payments/authorize`,
  expressApproveUrl: `${processorUrl}/payments/expressApprove`,
  authenticateThreeDSOrderUrl: `${processorUrl}/payments/3ds`,
  updateShippingUrl: `${processorUrl}/payments/updateShipping`,
  getStoredPaymentMethodsURL: `${processorUrl}/stored-payment-methods`,
})
// plus storedPaymentMethodUrl(processorUrl, id) => DELETE `${processorUrl}/stored-payment-methods/${id}`
```

It is strongly recommended that self-hosting merchants name their own BFF routes with these same
suffixes. **In legacy mode `processorUrl` is not recognized** — every URL must still be supplied
individually:

```tsx
const base = "https://my-backend.example.com";
<PayPal
  createPaymentUrl={`${base}/payments`}
  onApproveUrl={`${base}/payments/approve`}
  createOrderUrl={`${base}/payments/createOrder`}
  authorizeOrderUrl={`${base}/payments/authorize`}
  {...otherProps}
/>;
```

`getSettingsUrl`, `createVaultSetupTokenUrl` and `approveVaultSetupTokenUrl` are not used in
Checkout mode at all.

### Legacy-only props

These props exist only for self-hosting merchants and are ignored in Checkout mode
(`LegacyOnlyProps`, `src/types/index.ts`). They are kept for backward compatibility.

| Prop                                                                                           | Checkout-mode replacement                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `purchaseCallback`                                                                             | processor `MERCHANT_RETURN_URL` (or Checkout's `onComplete`)                                                                                                                             |
| `shippingMethodId`                                                                             | deprecated; see `processor` for the recommended BFF handling                                                                                                                             |
| `getSettingsUrl`                                                                               | processor config (`/operations/config`)                                                                                                                                                  |
| `getOrderUrl`                                                                                  | handled inside the relevant processor calls                                                                                                                                              |
| `onApproveRedirectionUrl`                                                                      | processor `PAYPAL_ONAPPROVE_PREFIX` / `MERCHANT_RETURN_URL` (see [Buyer redirect](#buyer-redirect-after-approval-merchantreturnurl))                                                     |
| `cartInformation`                                                                              | enabler `PaymentData`                                                                                                                                                                    |
| `getUserInfoUrl`, `createVaultSetupTokenUrl`, `approveVaultSetupTokenUrl`, `getClientTokenUrl` | none yet — kept at least until Checkout natively supports vaulting for all methods. For stored credit cards see processor stored payment methods; for other methods please open an issue |

The `version` fields on requests/responses are `@deprecated`: Checkout doesn't use them; they're
only relevant for a self-hosted backend that still tracks a client-side version. See the
`processor` implementation for handling requests without a version.

### `onRegisterSubmit` / `onRegisterValidation`

New props, not carried over from the standalone client. For the form-based components
(`CardFields`, `PayUponInvoice`), whether `onRegisterSubmit` is supplied is the entire signal
deciding which mode the component runs in — there is no separate flag:

- **Not supplied** (legacy default): the component renders its own "Pay" button and drives
  submission itself.
- **Supplied**: the component assumes Checkout's page-level "Pay" button drives it, stops rendering
  its own button, and hands a `submit`/`isValid`/`showValidation` implementation up via
  `onRegisterSubmit`/`onRegisterValidation`. The Checkout-only `CardFieldsStored` also uses
  `onRegisterSubmit`.

**If a self-hosting merchant supplies `onRegisterSubmit` without actually calling
`component.submit()`/`isValid()`/`showValidation()`** — i.e. without implementing the
`PaymentComponent` contract (`src/payment-enabler/interfaces/enabler.ts`) — the component's own
button disappears and nothing triggers submission: the form becomes silently unusable. Inside
Checkout, submitting a form component that never registered a handler throws instead.

Passing these props to a non-form component (e.g. `<PayPal/>`) has no effect.

### Error reporting (`onError`)

Checkout mode only; not supported for legacy components. Checkout's `EnablerOptions.onError` is
called with `paymentReference` (the commercetools Payment id) added. `CardFields` reports 3DS
outcomes through it as `THREE_DS_DECLINED_RETRY` / `THREE_DS_DECLINED`, and a stuck submission as
`CARD_FIELDS_SUBMIT_TIMEOUT` (see [3DS](#3ds-credit-card)).

### PayPal JS SDK script options (currency, funding sources, etc.)

In Checkout mode every standard component — the PayPal-brand buttons (including AllButtons, Credit
and the local payment methods), `CardFields`, Apple Pay, Google Pay and Pay Upon Invoice — shares
one PayPal JS SDK script load, resolved once in `_Setup()` and loaded before any component mounts
(`src/app/preloadPayPalScript.ts`). `CardFieldsStored` loads no script at all.

Its options (`currency`, `components`, `enableFunding`/`disableFunding`, `buyerCountry`, `locale`,
`vault`, …) were component props in the standalone client; in Checkout mode they come from the
processor's `PAYPAL_STANDARD_SCRIPT_OPTIONS` (`processor/.env.template`). This is one flat object,
deliberately **not** configurable per payment method — every standard component must request the
identical script to share one load. If you need different values for one specific method, please
open an issue.

The processor adjusts the options per request:

- `currency` and `buyerCountry` come from the cart (total price currency and the cart's `country`
  field, not an address; `buyerCountry` only in sandbox). The env values are only a fallback.
- `components` loses `card-fields` when the merchant settings don't accept credit cards (which also
  disables `CardFieldsStored`).
- `venmo` is added to `enableFunding` unless the merchant settings disable Venmo.

PayPal Express (`builderType: "express"`) always mounts alone and is configured independently via
`PAYPAL_EXPRESS_SDK_OPTIONS` (only `currency` is overlaid from the cart).

In legacy mode each component can still receive its own script options, and it is the merchant's
responsibility to avoid concurrent script loads (e.g. render a component only after its payment
method is selected — the opposite of what Checkout does).

### PayPal button style (`paypalButtonConfig`) per payment method

The PayPal button `style` (color/label/shape) is resolved per mounted payment method in
`src/components/RenderTemplate/resolveOptions.ts`, highest priority first:

1. the payment method's own override — `settings.<paymentMethodType>.style`, or
   `settings.PayPalExpress.style` for the Express builder;
2. the shared merchant settings (`paypalButtonConfig` + `buttonShape` from the custom application /
   `PAYPAL_SETTINGS`);
3. the enabler's built-in default.

Each layer replaces the whole `style` object — fields are not merged. Overrides come from the
processor's `PAYPAL_BUTTON_CONFIG`. Example:

```json
{
  "PayPalExpress": {
    "style": {
      "buttonColor": "black",
      "buttonLabel": "pay",
      "buttonShape": "pill"
    }
  }
}
```

Express ends up black/pill; its label is still `buynow`, because the Express label is always forced
to `buynow`. Standard PayPal keeps the shared custom-application style. A partial override such as
`{"style": {"buttonColor": "black"}}` would leave label and shape unset rather than inherit them.

The same config also accepts `fundingSource`, `messagesStyle`, `disablePayLaterButton` (PayPal),
`applePayDisplayName` (Apple Pay), Google Pay fields and `invoiceBenefitsMessage` (Pay Upon
Invoice) — see the sections below.

## Payment method availability

Checkout asks each component's `isAvailable()` before listing it
(`src/components/PayPalBuilder.ts`). A method is hidden when:

- its funding source (Sepa, PayLater, PayPalCreditCard, Venmo, local methods, …) is in the shared
  `disableFunding`;
- `CardFields`, Apple Pay or Google Pay is missing its entry (`card-fields`, `applepay`,
  `googlepay`) in the shared `components`;
- Venmo or Apple Pay isn't supported by the buyer's browser/device.

If a single-funding-source button still mounts somewhere PayPal considers it ineligible (e.g. wrong
currency/country), PayPal's SDK renders nothing. The component then shows an inline "This payment
method is not available for your cart." message (`useFundingSourceEligible.ts`).

## Stored cards and vaulting

- `createStoredPaymentMethodBuilder` supports credit cards (`card`) only; other types throw.
  Whether stored methods are offered at all follows the processor's `STORED_PAYMENT_METHODS_ENABLED`.
- `CardFieldsStored` renders no UI of its own — Checkout's stored-payment-methods component shows
  the saved card. It charges the card without loading the PayPal SDK; the charge may still require
  buyer action (`PAYER_ACTION_REQUIRED`). `remove()` throws if the deletion fails. Not available in
  legacy mode.
- The "save this card" option is never offered to anonymous shoppers. Checkout's own
  `storePaymentDetails` choice and the component's checkbox are combined (either saves the card).
- The saved-card list inside `CardFields` is shown in legacy mode only.
- Vaulting through PayPal-brand buttons and Apple Pay is off in Checkout mode.
- `PaymentTokens` (the standalone stored-methods list) is legacy-only and unreachable from Checkout.
  If you want it wired into Checkout, please open an issue.

## PayPal Express

- The button label is always `buynow`; the extra Pay Later button is never shown.
- The buyer can change the shipping address in the PayPal popup. In Checkout, shipping changes go
  through `POST {processorUrl}/payments/updateShipping`; in legacy mode register `onShippingChange`
  on the component instead.
- Before a Payment exists, the button shows Checkout's `initialAmount`. Checkout must create the
  cart in `onPayButtonClick`.

### Buyer redirect after approval (`merchantReturnUrl`)

`authorizeOrder()`/`captureOrder()` responses — and `createOrder()` for orders that settle
immediately (stored card, Pay Upon Invoice) — can carry an optional `merchantReturnUrl`. When
present, the enabler navigates the buyer there instead of showing the normal result UI. The
processor builds it from the Checkout session's return url, else the static `MERCHANT_RETURN_URL`
env var. `PAYPAL_ONAPPROVE_PREFIX` is **never** used here.

The legacy `onApproveRedirectionUrl` prop is superseded by this.

### PayPal Express legal-review requirement (`PAYPAL_REDIRECT_ON_APPROVE`)

Some jurisdictions (Germany, for PayPal Express) legally require the buyer to see a final review
page before the payment settles, even after approving in the PayPal popup. With
`PAYPAL_REDIRECT_ON_APPROVE=true` **or** `PAYPAL_ONAPPROVE_PREFIX` set (**required, with that
review page actually built, for PayPal Express in Germany**), the buyer is redirected on approval —
for both Authorize and Capture intent — _instead of_ the connector calling
`authorizeOrder()`/`captureOrder()`, so the merchant's own backend decides when to finish the
payment.

The target is built at approval time by `POST {processorUrl}/payments/expressApprove` (which also
adds a placeholder transaction so commercetools creates the Order): `PAYPAL_ONAPPROVE_PREFIX`, else
the session return url, else `MERCHANT_RETURN_URL`. If none is configured, the enabler falls back
to the legacy `onApproveRedirectionUrl` prop (with `?order_id=` appended), then to finishing the
payment immediately. The processor setting takes priority over the legacy prop.

Once the buyer has left the Checkout session, the only sanctioned way back into this connector is
commercetools' **Payment Intents API** (`capturePayment`, authenticated with the merchant's own
commercetools API credentials) — it has no separate "authorize" action.
`settlement()` (bound to `capturePayment`) captures directly when the configured intent is Capture
or the payment already has an approved authorization; otherwise it authorizes, and the response
tells the merchant to call `capturePayment` again once ready to collect funds.

**Two different "own backend" cases, don't conflate them:**

- A merchant running their own backend **outside** commercetools Checkout should use
  `paypal-commercetools-extension`'s custom-field-driven API instead.
- A merchant **integrated with Checkout** should stay on Checkout's native Payment Intents API.

## Pay Upon Invoice

- Always uses PayPal intent Capture in Checkout mode, whatever the connector intent is. In legacy
  mode the merchant must configure Capture themselves.
- The payable amount is fixed at 5–2500 EUR and the FraudNet page id is fixed; only
  `invoiceBenefitsMessage` can be overridden (`PAYPAL_BUTTON_CONFIG.PayUponInvoice`).
- For an ineligible cart the component shows the reason, and Checkout's `submit()` rejects with it.
- In Checkout, pressing Enter in the form never submits it.

## Pay Later button and messages

- The standard PayPal button renders an extra Pay Later button below it when the merchant settings
  accept Pay Later, unless `PAYPAL_BUTTON_CONFIG.PayPal.disablePayLaterButton` is `true` (ops-only,
  no custom-application equivalent). Never shown for Express.
- The Pay Later message (`<PayPalMessages/>`) is shown only for the `paypal` funding source, for
  buyer countries US, AU, CA, FR, DE, IT, ES, GB, and only if `messages` is in the script
  `components`. Placement is `product` for Express and `payment` otherwise.
- In Checkout the message amount comes from the cart; in legacy mode the merchant provides the
  message content. If the cart currency differs from the PayPal account currency, no message is
  shown (PayPal's own error may name a different reason).
- Style comes from the custom application's `payLater*` settings, or
  `PAYPAL_BUTTON_CONFIG.<type>.messagesStyle`. The layout is fixed to `text`; if you need `flex`,
  please open an issue.

## Local payment methods

Supported: iDEAL (`Ideal`), Bancontact, EPS, MyBank, Przelewy24 (`P24`), BLIK. Their commercetools
icon keys are `ideal`, `bancontactcard`, `eps`, `mybank`, `przelewy24`, `blik`
(`src/components/paymentMethodTypeMapping.ts`).

Not supported yet, but can be added on merchant request after a short test phase: Verkkopankki,
PayU, Trustly, Zimpler, Maxima, OXXO, Boleto Bancário, WeChat Pay, Mercado Pago, Multibanco, Itaú.
Giropay and Sofort are discontinued by PayPal.

## Google Pay

`environment` (TEST/PRODUCTION) follows the processor's `PAYPAL_ENVIRONMENT` and
`verificationMethod` follows the shared 3DS setting (`threeDSOption`); neither is overridable.
Allowed card networks/auth methods, callback intents and button appearance can be overridden via
`PAYPAL_BUTTON_CONFIG.GooglePay`.

## 3DS (credit card)

The shared `threeDSOption` setting (`SCA_ALWAYS` / `SCA_WHEN_REQUIRED`) drives `CardFields` (and
Google Pay). When unset, no 3DS authentication call is made. Outcomes: approved → payment
continues; retry → warning, `THREE_DS_DECLINED_RETRY`; declined → "select a different method",
`THREE_DS_DECLINED`. In Checkout, `submit()` stays pending until the outcome is known, with a 90 s
safety timeout (`CARD_FIELDS_SUBMIT_TIMEOUT`).

## Apple Pay

The store name shown in Apple's payment sheet can be set via
`PAYPAL_BUTTON_CONFIG.ApplePay.applePayDisplayName`.

**"Error validating merchant":** if the native payment sheet opens but then fails with this error,
it is not a bug in this component — PayPal rejected `pay.validateMerchant()`
(`src/components/ApplePay/ApplePayMask.tsx`) because the domain serving `enabler` isn't
registered/verified for Apple Pay on the PayPal merchant account in use. Refer to the Apple or
PayPal documentation regarding `.well-known/apple-developer-merchantid-domain-association`.

The enabler also checks device/browser support for Apple Pay: on an ineligible device the method
is not shown.

## Venmo

`Venmo` only works for USD-denominated orders with a US buyer. `processor` enforces the currency
at order creation (`validateVenmoOrderParams` in `paypal-payment.service.ts`), but
`GET /operations/payment-components` (`getSupportedPaymentComponents()`, JWT-only, no cart in
context) always lists `Venmo`. Restricting Venmo to eligible carts is a merchant-configured
Checkout payment-integration predicate, not something the connector enforces.

What the connector _does_ enforce is browser support (`src/components/venmoAvailability.ts`,
`isVenmoSupported()`): per [PayPal's Venmo documentation](https://developer.paypal.com/v5/venmo/overview),
only Safari on iOS or Chrome on Android on mobile; desktop is unrestricted (QR-code checkout).
It is checked in `isAvailable()`, so Checkout doesn't list Venmo on an unsupported browser, and
again in `PayPalMask.tsx` as a post-mount safety net.
