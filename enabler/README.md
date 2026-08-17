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

## What this package is for

The primary purpose of `enabler` today is to be the frontend half of a commercetools **Checkout**
connector: a component library that mounts inside commercetools Checkout via the standard
`enabler`/`processor` pattern.

We provide **limited backward compatibility** with the discontinued npm client by keeping its
component code and props working: a merchant who already used an npm client with own bff can self-host these components outside
commercetools Checkout, and is free to use this code for that purpose. That said,
self-hosting is not the focus of ongoing development — new work targets the Checkout integration,
not the standalone path. If you are interested in standalone option please open an issue.

## Checkout mode is intentionally limited

When these components are mounted inside commercetools Checkout, their functionality is
deliberately scoped down to match what commercetools Checkout itself supports. Not everything the
standalone client could do carries over.

**If you need functionality that existed in the standalone client but isn't available in Checkout
mode, please open an issue**.

## Principal differences in Checkout mode

This list highlights the most consequential differences — it isn't exhaustive.

1. **No "vault only" flow.** Saving a payment method with no accompanying payment isn't supported.
   Checkout only supports paying, optionally _with_ vaulting the card used for that payment at the
   same time.
2. **Purchase-and-vault is credit-card only.** Paying and saving the payment method in the same
   transaction is not available for other payment sources.
3. **Only stored credit cards, not PayPal accounts.** A previously-saved PayPal account is not
   offered as a stored payment method in Checkout mode, even though the standalone client's
   stored-payment-methods list could show one.
4. **Form-based components submit and validate through Checkout, not their own button.**
   Components that collect input via a form (credit card, Pay Upon Invoice) no longer render their own "Pay"/"Submit"
   button when mounted in Checkout. Checkout renders the button and drives each component's submission and
   validation itself instead. See `onRegisterSubmit` under "Component props" below for the exact
   mechanism.

## Component props

### Legacy per-endpoint URLs vs. `processorUrl`

The standalone client configured each component with a list of individually-named endpoint URLs —
`createPaymentUrl`, `onApproveUrl`, `createOrderUrl`, `authorizeOrderUrl`, and so on — each pointing
at a self-hosted backend route the merchant implemented. **These props are still supported, but they
are deprecated.**

It is strongly recommended that self-hosting merchants rename their own backend-for-frontend (BFF)
routes to match the single-`processorUrl` pattern below now, rather than later. The derivation is a
fixed set of path suffixes appended to `processorUrl` — matching them today means that dropping the
individual `*Url` props in favor of one `processorUrl` later requires no backend route changes at
all. This is the exact mapping used (`processorUrls()`, `src/components/constants.ts`):

```ts
processorUrls(processorUrl) => ({
  createPaymentUrl: `${processorUrl}/payments`,
  onApproveUrl: `${processorUrl}/payments/approve`,
  createOrderUrl: `${processorUrl}/payments/createOrder`,
  authorizeOrderUrl: `${processorUrl}/payments/authorize`,
  authenticateThreeDSOrderUrl: `${processorUrl}/payments/3ds`,
  getStoredPaymentMethodsURL: `${processorUrl}/stored-payment-methods`,
})
```

Note that commercetools Checkout itself has no notion of a merchant deploying/configuring
`enabler` individually — Checkout mounts these components and supplies `processorUrl` on its own,
via this repo's `processor`. The pattern above is what a self-hosting merchant adopts to match that
same shape:

```tsx
// Before — every endpoint named and pointed at your own backend
<PayPal
  createPaymentUrl="https://my-backend.example.com/create-payment"
  onApproveUrl="https://my-backend.example.com/approve"
  createOrderUrl="https://my-backend.example.com/create-order"
  authorizeOrderUrl="https://my-backend.example.com/authorize"
  {...otherProps}
/>

// After — one processorUrl, matching the same routes Checkout itself uses
<PayPal processorUrl="https://my-backend.example.com" {...otherProps} />
```

`resolveEndpointUrl` (`src/helpers/resolveEndpointUrl.ts`) prefers the `processorUrl`-derived route
when a `processorUrl` is supplied, and falls back to whichever legacy `*Url` prop was passed
directly otherwise — so migrating a component to `processorUrl` is a safe, drop-in change with no
behavior difference, not something that requires a coordinated cutover across every prop at once.

### `onRegisterSubmit` — the checkout-mode marker

For form-based components, whether `onRegisterSubmit` is supplied is the entire signal deciding
which mode the component runs in — there is no separate flag for it:

- **Not supplied** (the default for a self-hosting/standalone merchant): the component behaves like
  the standalone client always did — it renders its own "Pay"/"Save" button and drives submission
  itself.
- **Supplied**: the component assumes it's being driven externally (Checkout's own page-level "Pay"
  button) and stops rendering that internal button. Instead, it calls `onRegisterSubmit`/
  `onRegisterValidation` once ready, handing a `submit`/`isValid`/`showValidation` implementation up
  to whatever holds the component instance.

**If a self-hosting merchant supplies `onRegisterSubmit` without also being the thing that calls
`component.submit()`/`isValid()`/`showValidation()`** — i.e. without implementing the Checkout side
of that contract themselves — the component's own button disappears and nothing else ever triggers
submission: the form becomes silently unusable. Only pass `onRegisterSubmit` if you are actually
driving the component through the `PaymentComponent` contract
(`src/payment-enabler/interfaces/enabler.ts`) yourself.

### New props: `onRegisterSubmit` / `onRegisterValidation`

These two props are new additions, not carried over from the standalone client. They only affect
form-based components (`CardFields` today). If a self-hosting merchant mounts a **non-form**
component (e.g. `<PayPal/>`) and accidentally passes one of these props anyway, nothing breaks:
they simply aren't consumed by that component and have no effect — `<PayPal/>`'s own button keeps
rendering and working exactly as before.
