import { PaymentTokenResponse } from 'common-connect';
import { StoredPaymentMethod } from '../dtos/stored-payment-methods.dto';

type NonNullableCard = NonNullable<NonNullable<PaymentTokenResponse['payment_source']>['card']>;

// Narrows to a token that definitely has an id and a card payment_source, so
// mapPayPalPaymentTokenToStoredPaymentMethod below never needs to re-check or return undefined.
type CardPaymentToken = PaymentTokenResponse & {
  id: string;
  payment_source: { card: NonNullableCard };
};

/**
 * commercetools Checkout's own UI only supports displaying/reusing stored credit cards, so other
 * funding sources (e.g. payment_source.paypal) stay vaulted in PayPal but aren't surfaced here.
 */
export const isCardPaymentToken = (
  token: PaymentTokenResponse,
): token is CardPaymentToken => !!token.payment_source?.card && !!token.id;

/**
 * Maps a PayPal vault payment token to the enabler's stored-payment-method shape.
 * Takes a token already narrowed by isCardPaymentToken — every field this reads is guaranteed
 * present, so there's nothing here for the caller to filter out afterward.
 */
export const mapPayPalPaymentTokenToStoredPaymentMethod = (
  token: CardPaymentToken,
  createdAt: string,
): StoredPaymentMethod => {
  const { card } = token.payment_source;
  const [expiryYear, expiryMonth] = card.expiry?.split('-') ?? [];

  return {
    id: token.id,
    type: 'card',
    token: token.id,
    // PayPal's vault token response has no default-payment-method flag to source this from.
    isDefault: false,
    createdAt,
    displayOptions: {
      endDigits: card.last_digits,
      brand: card.brand ? { key: card.brand } : undefined,
      expiryMonth: expiryMonth ? parseInt(expiryMonth, 10) : undefined,
      expiryYear: expiryYear ? parseInt(expiryYear, 10) : undefined,
    },
  };
};
