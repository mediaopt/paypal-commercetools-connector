import { describe, test } from '@jest/globals';
import { mapPayPalPaymentSourceToCommercetoolsMethodInfo } from '../src/utils/map.utils';
describe('Testing map utilities', () => {
  test.each([
    { name: 'card', source: { card: { name: 'TEST' } } },
    { name: 'eps', source: { eps: { name: 'TEST' } } },
    {
      name: 'bancontact',
      source: { bancontact: { name: 'TEST' } },
    },
    { name: 'blik', source: { blik: { name: 'TEST' } } },
    { name: 'p24', source: { p24: { email: 'TEST' } } },
    { name: 'giropay', source: { giropay: { name: 'TEST' } } },
    { name: 'ideal', source: { ideal: { iban_last_chars: 'TEST' } } },
    { name: 'mybank', source: { mybank: { iban_last_chars: 'TEST' } } },
    { name: 'paypal', source: { paypal: { email_address: 'TEST' } } },
    { name: 'sofort', source: { sofort: { iban_last_chars: 'TEST' } } },
    { name: 'trustly', source: { trustly: { iban_last_chars: 'TEST' } } },
    { name: 'venmo', source: { venmo: { email_address: 'TEST' } } },
  ])('map $name', async ({ name, source }) => {
    const mapped = mapPayPalPaymentSourceToCommercetoolsMethodInfo(source);
    expect(mapped.toLowerCase()).toContain(name);
    expect(mapped).toContain('TEST');
  });
});
