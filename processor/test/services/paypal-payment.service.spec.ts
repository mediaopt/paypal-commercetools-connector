import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Cart, Payment } from '@commercetools/connect-payments-sdk';

// createPayPalOrder is exported as a non-configurable ES module binding; jest.spyOn cannot
// replace it. Use jest.mock with a factory so Jest swaps the module before imports run —
// mirrors the braintree reference project's transactionSale mocking pattern.
jest.mock('common-connect', () => ({
  ...(jest.requireActual('common-connect') as object),
  createPayPalOrder: jest.fn(),
  getPayPalOrder: jest.fn(),
  authorizePayPalOrder: jest.fn(),
  capturePayPalOrder: jest.fn(),
  capturePayPalAuthorization: jest.fn(),
  getSettings: jest.fn(),
  getPaymentTokens: jest.fn(),
  deletePaymentToken: jest.fn(),
  generateUserIdToken: jest.fn(),
}));
import * as CommonConnect from 'common-connect';

import { paymentSDK } from '../../src/payment-sdk';
import { PayPalPaymentService } from '../../src/services/paypal-payment.service';
import { PayPalCustomerService } from '../../src/services/paypal-customer.service';
import { PayPalPaymentServiceOptions } from '../../src/services/types/paypal-payment.type';
import * as FastifyContext from '../../src/libs/fastify/context/context';
import * as ConfigModule from '../../src/config/config';

describe('paypal-payment.service', () => {
  const opts: PayPalPaymentServiceOptions = {
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
    ctPaymentMethodService: paymentSDK.ctPaymentMethodService,
    ctAPI: paymentSDK.ctAPI,
  };
  const paypalPaymentService = new PayPalPaymentService(opts);

  const mockCart = {
    id: 'cart-id',
    shippingMode: 'Single',
    taxCalculationMode: 'LineItemLevel',
    lineItems: [],
    locale: 'en-US',
    totalPrice: { type: 'centPrecision', currencyCode: 'USD', centAmount: 1000, fractionDigits: 2 },
  } as unknown as Cart;

  const mockPayment = {
    id: 'payment-id',
    version: 3,
    interfaceId: undefined,
    amountPlanned: { type: 'centPrecision', currencyCode: 'USD', centAmount: 1000, fractionDigits: 2 },
    paymentMethodInfo: {},
    transactions: [],
  } as unknown as Payment;

  const mockPayPalOrder = {
    id: 'paypal-order-id',
    status: 'CREATED',
    payment_source: { paypal: { email_address: 'buyer@example.com' } },
    links: [{ href: 'https://paypal.com/approve', rel: 'approve', method: 'GET' }],
  };

  const mockCtCustomer = {
    id: 'ct-customer-id',
    version: 1,
    custom: { fields: { PayPalUserId: 'paypal-customer-id' } },
  };

  // paymentSDK.ctAPI.client is a non-configurable getter in the SDK; save/restore manually.
  let savedClient: unknown;
  const mockClientPost = jest.fn();
  const mockClientExecute = jest.fn();
  const mockCustomerGetExecute = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(FastifyContext, 'getCartIdFromContext').mockReturnValue(mockCart.id);
    jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCart);
    jest.spyOn(paymentSDK.ctPaymentService, 'getPayment').mockResolvedValue(mockPayment);
    (CommonConnect.createPayPalOrder as jest.Mock).mockResolvedValue(mockPayPalOrder as never);
    (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue(mockPayPalOrder as never);

    savedClient = paymentSDK.ctAPI.client;
    mockClientExecute.mockResolvedValue({ body: mockPayment } as never);
    mockClientPost.mockReturnValue({ execute: mockClientExecute });
    mockCustomerGetExecute.mockResolvedValue({ body: mockCtCustomer } as never);
    (paymentSDK.ctAPI as any).client = {
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({ post: mockClientPost }),
      }),
      customers: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ execute: mockCustomerGetExecute }) }),
      }),
    };
  });

  afterEach(() => {
    (paymentSDK.ctAPI as any).client = savedClient;
    jest.restoreAllMocks();
  });

  test('creates a PayPal order and syncs interfaceId/status onto the CT payment', async () => {
    const result = await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'paypal' },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: 'CAPTURE',
        purchase_units: [expect.objectContaining({ invoice_id: mockPayment.id })],
        payment_source: expect.objectContaining({ paypal: expect.any(Object) }),
      }),
    );

    expect(mockClientPost).toHaveBeenCalledWith({
      body: {
        version: mockPayment.version,
        actions: expect.arrayContaining([
          { action: 'setInterfaceId', interfaceId: mockPayPalOrder.id },
          { action: 'setStatusInterfaceCode', interfaceCode: mockPayPalOrder.status },
          { action: 'setStatusInterfaceText', interfaceText: mockPayPalOrder.status },
        ]),
      },
    });

    expect(result).toEqual({
      orderData: {
        id: mockPayPalOrder.id,
        status: mockPayPalOrder.status,
        payment_source: mockPayPalOrder.payment_source,
        links: mockPayPalOrder.links,
      },
    });
  });

  test('does not add a transaction to the CT payment', async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'paypal' },
    });

    const [{ body }] = mockClientPost.mock.calls[0] as [{ body: { actions: { action: string }[] } }];
    expect(body.actions.some((action) => action.action.toLowerCase().includes('transaction'))).toBe(false);
  });

  test('forwards storeInVault/vaultId into payment_source.paypal', async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'paypal', storeInVault: true, vaultId: 'vault-123' },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: {
          paypal: expect.objectContaining({
            attributes: { vault: { store_in_vault: 'ON_SUCCESS', usage_type: 'MERCHANT' } },
            vault_id: 'vault-123',
          }),
        },
      }),
    );
  });

  test('forwards storeInVault/vaultId into payment_source.card', async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'card', storeInVault: true, vaultId: 'vault-123' },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: {
          card: expect.objectContaining({
            attributes: { vault: { store_in_vault: 'ON_SUCCESS' } },
            vault_id: 'vault-123',
          }),
        },
      }),
    );
  });

  test("attaches a returning customer's existing PayPal customer id when vaulting a new card", async () => {
    jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({ ...mockCart, customerId: mockCtCustomer.id });

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'card', storeInVault: true },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: {
          card: expect.objectContaining({
            attributes: expect.objectContaining({
              customer: { id: mockCtCustomer.custom.fields.PayPalUserId },
            }),
          }),
        },
      }),
    );
  });

  test('does not look up the CT customer when not vaulting', async () => {
    const getCtCustomerSpy = jest.spyOn(PayPalCustomerService.prototype, 'getCtCustomer');
    jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({ ...mockCart, customerId: mockCtCustomer.id });

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'card' },
    });

    expect(getCtCustomerSpy).not.toHaveBeenCalled();
  });

  test('omits payment_source for a not-yet-wired funding source', async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'venmo' },
    });

    const [orderRequest] = (CommonConnect.createPayPalOrder as jest.Mock).mock.calls[0] as [Record<string, unknown>];
    expect(orderRequest.payment_source).toBeUndefined();
  });

  test('throws and does not sync the CT payment when the PayPal call fails', async () => {
    (CommonConnect.createPayPalOrder as jest.Mock).mockRejectedValue(new Error('PayPal is down') as never);

    await expect(
      paypalPaymentService.createOrder({ paymentId: mockPayment.id, orderData: { paymentSource: 'paypal' } }),
    ).rejects.toThrow(`Failed to create PayPal order for payment ${mockPayment.id}`);

    expect(mockClientPost).not.toHaveBeenCalled();
  });

  test('does not overwrite interfaceId once already set', async () => {
    jest.spyOn(paymentSDK.ctPaymentService, 'getPayment').mockResolvedValue({
      ...mockPayment,
      interfaceId: 'already-set',
    } as Payment);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: 'paypal' },
    });

    const [{ body }] = mockClientPost.mock.calls[0] as [{ body: { actions: { action: string }[] } }];
    expect(body.actions.some((action) => action.action === 'setInterfaceId')).toBe(false);
  });

  describe('authorizeOrder', () => {
    const mockAuthorizedOrder = {
      id: 'paypal-order-id',
      status: 'COMPLETED',
      purchase_units: [{ payments: { authorizations: [{ id: 'auth-id', status: 'CREATED' }] } }],
    };

    beforeEach(() => {
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue(mockAuthorizedOrder as never);
      jest.spyOn(paymentSDK.ctPaymentService, 'updatePayment').mockResolvedValue(mockPayment);
    });

    test('adds an Authorization transaction and syncs status', async () => {
      await paypalPaymentService.authorizeOrder({ paymentId: mockPayment.id, orderID: mockAuthorizedOrder.id });

      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.objectContaining({ type: 'Authorization' }) }),
      );
    });

    test("links the vaulted card's PayPal customer id to the CT customer", async () => {
      const linkSpy = jest.spyOn(PayPalCustomerService.prototype, 'linkPayPalCustomerId').mockResolvedValue();
      jest.spyOn(paymentSDK.ctPaymentService, 'getPayment').mockResolvedValue({
        ...mockPayment,
        customer: { typeId: 'customer', id: 'ct-customer-id' },
      } as Payment);
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue({
        ...mockAuthorizedOrder,
        payment_source: { card: { attributes: { vault: { customer: { id: 'paypal-vault-customer-id' } } } } },
      } as never);

      await paypalPaymentService.authorizeOrder({ paymentId: mockPayment.id, orderID: mockAuthorizedOrder.id });

      expect(linkSpy).toHaveBeenCalledWith('ct-customer-id', 'paypal-vault-customer-id');
    });

    test('does not attempt to link when the order was not vaulted', async () => {
      const linkSpy = jest.spyOn(PayPalCustomerService.prototype, 'linkPayPalCustomerId').mockResolvedValue();

      await paypalPaymentService.authorizeOrder({ paymentId: mockPayment.id, orderID: mockAuthorizedOrder.id });

      expect(linkSpy).not.toHaveBeenCalled();
    });

    test('includes merchantReturnUrl built from onApprovePrefix for the express flow', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        onApprovePrefix: 'https://merchant.example.com/approve',
      });

      const result = await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
        builderType: 'express' as never,
      });

      expect(result.merchantReturnUrl).toContain('https://merchant.example.com/approve');
    });

    test('omits merchantReturnUrl when nothing is configured', async () => {
      const result = await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      expect(result.merchantReturnUrl).toBeUndefined();
    });
  });

  describe('captureOrder', () => {
    const mockCapturedOrder = {
      id: 'paypal-order-id',
      status: 'COMPLETED',
      purchase_units: [{ payments: { captures: [{ id: 'capture-id', status: 'COMPLETED' }] } }],
    };

    beforeEach(() => {
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue(mockCapturedOrder as never);
      jest.spyOn(paymentSDK.ctPaymentService, 'updatePayment').mockResolvedValue(mockPayment);
    });

    test('adds a Charge transaction and syncs status', async () => {
      await paypalPaymentService.captureOrder({ paymentId: mockPayment.id, orderID: mockCapturedOrder.id });

      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.objectContaining({ type: 'Charge' }) }),
      );
    });

    test("links the vaulted card's PayPal customer id to the CT customer", async () => {
      const linkSpy = jest.spyOn(PayPalCustomerService.prototype, 'linkPayPalCustomerId').mockResolvedValue();
      jest.spyOn(paymentSDK.ctPaymentService, 'getPayment').mockResolvedValue({
        ...mockPayment,
        customer: { typeId: 'customer', id: 'ct-customer-id' },
      } as Payment);
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue({
        ...mockCapturedOrder,
        payment_source: { card: { attributes: { vault: { customer: { id: 'paypal-vault-customer-id' } } } } },
      } as never);

      await paypalPaymentService.captureOrder({ paymentId: mockPayment.id, orderID: mockCapturedOrder.id });

      expect(linkSpy).toHaveBeenCalledWith('ct-customer-id', 'paypal-vault-customer-id');
    });

    test('includes merchantReturnUrl built from onApprovePrefix for the express flow', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        onApprovePrefix: 'https://merchant.example.com/approve',
      });

      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
        builderType: 'express' as never,
      });

      expect(result.merchantReturnUrl).toContain('https://merchant.example.com/approve');
      expect(result.merchantReturnUrl).toContain(`paymentReference=${mockPayment.id}`);
    });

    test('includes merchantReturnUrl built from the generic MERCHANT_RETURN_URL for a non-express call', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        returnUrl: 'https://merchant.example.com/result',
        onApprovePrefix: 'https://merchant.example.com/approve',
      });

      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(result.merchantReturnUrl).toContain('https://merchant.example.com/result');
    });

    test('omits merchantReturnUrl when nothing is configured', async () => {
      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(result.merchantReturnUrl).toBeUndefined();
    });
  });

  describe('settlement', () => {
    const mockAmount = { type: 'centPrecision', currencyCode: 'USD', centAmount: 1000, fractionDigits: 2 } as never;

    test('captures directly when the configured intent is Capture and nothing has been authorized', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({ payPalIntent: 'Capture' } as never);
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue({
        id: 'paypal-order-id',
        status: 'COMPLETED',
        purchase_units: [{ payments: { captures: [{ id: 'capture-id', status: 'COMPLETED' }] } }],
      } as never);
      jest.spyOn(paymentSDK.ctPaymentService, 'updatePayment').mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: { ...mockPayment, interfaceId: 'paypal-order-id' } as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.capturePayPalOrder).toHaveBeenCalledWith('paypal-order-id', {});
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.objectContaining({ type: 'Charge' }) }),
      );
      expect(result).toEqual(
        expect.objectContaining({ success: true, message: `Payment ${mockPayment.id} captured successfully` }),
      );
    });

    test('captures the existing authorization when intent is Authorize and one already exists', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({ payPalIntent: 'Authorize' } as never);
      (CommonConnect.capturePayPalAuthorization as jest.Mock).mockResolvedValue({
        id: 'capture-id',
        status: 'COMPLETED',
      } as never);
      jest.spyOn(paymentSDK.ctPaymentService, 'updatePayment').mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: {
          ...mockPayment,
          transactions: [{ type: 'Authorization', state: 'Success', interactionId: 'auth-id' }],
        } as unknown as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.capturePayPalAuthorization).toHaveBeenCalledWith(
        'auth-id',
        expect.objectContaining({ amount: expect.anything() }),
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.objectContaining({ type: 'Charge' }) }),
      );
      expect(result).toEqual(
        expect.objectContaining({ success: true, message: `Payment ${mockPayment.id} captured successfully` }),
      );
    });

    test('authorizes when intent is Authorize and nothing has been authorized yet', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({ payPalIntent: 'Authorize' } as never);
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue({
        id: 'paypal-order-id',
        status: 'CREATED',
        purchase_units: [{ payments: { authorizations: [{ id: 'auth-id', status: 'CREATED' }] } }],
      } as never);
      jest.spyOn(paymentSDK.ctPaymentService, 'updatePayment').mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: { ...mockPayment, interfaceId: 'paypal-order-id' } as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.authorizePayPalOrder).toHaveBeenCalledWith('paypal-order-id', {});
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.objectContaining({ type: 'Authorization' }) }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} authorized — call capturePayment again to capture funds`,
        }),
      );
    });

    test('throws when intent is Capture, nothing has been authorized, and the payment has no interfaceId', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({ payPalIntent: 'Capture' } as never);

      await expect(
        paypalPaymentService.settlement({ payment: mockPayment, amount: mockAmount }),
      ).rejects.toThrow(`Payment ${mockPayment.id} has no associated PayPal order to settle`);
    });

    test('throws when intent is Authorize, nothing has been authorized, and the payment has no interfaceId', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({ payPalIntent: 'Authorize' } as never);

      await expect(
        paypalPaymentService.settlement({ payment: mockPayment, amount: mockAmount }),
      ).rejects.toThrow(`Payment ${mockPayment.id} has no associated PayPal order to settle`);
    });
  });

  describe('authenticateThreeDSOrder', () => {
    test('returns the 3DS result when the PayPal order has an authentication_result', async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        payment_source: {
          card: {
            authentication_result: {
              liability_shift: 'POSSIBLE',
              three_d_secure: { enrollment_status: 'Y', authentication_status: 'Y' },
            },
          },
        },
      } as never);

      const result = await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(CommonConnect.getPayPalOrder).toHaveBeenCalledWith(mockPayPalOrder.id);
      expect(result).toEqual({
        approve: {
          liability_shift: 'POSSIBLE',
          three_d_secure: { enrollment_status: 'Y', authentication_status: 'Y' },
        },
      });
    });

    test('omits approve entirely when the PayPal order has no authentication_result', async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue(mockPayPalOrder as never);

      const result = await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(result).toEqual({});
      expect(result).not.toHaveProperty('approve');
    });

    test('does not mutate the CT payment', async () => {
      await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(mockClientPost).not.toHaveBeenCalled();
    });

    test('throws when orderID does not match the payment\'s interfaceId', async () => {
      jest.spyOn(paymentSDK.ctPaymentService, 'getPayment').mockResolvedValue({
        ...mockPayment,
        interfaceId: 'some-other-order-id',
      } as Payment);

      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        }),
      ).rejects.toThrow(`Order ${mockPayPalOrder.id} does not belong to payment ${mockPayment.id}`);

      expect(CommonConnect.getPayPalOrder).not.toHaveBeenCalled();
    });

    test('does not throw when interfaceId is not set yet', async () => {
      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        }),
      ).resolves.toBeDefined();
    });

    test('throws when the PayPal lookup fails', async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockRejectedValue(new Error('PayPal is down') as never);

      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        }),
      ).rejects.toThrow(`Failed to look up PayPal order ${mockPayPalOrder.id}`);
    });
  });

  describe('config', () => {
    test('returns settings from the CT custom object when available', async () => {
      const settings = { acceptPayPal: true } as never;
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(settings);

      const result = await paypalPaymentService.config();

      expect(result.settings).toEqual(settings);
    });

    test('falls back to env-configured settings when the custom object is unavailable', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(undefined as never);
      const fallbackSettings = { acceptPayPal: false };
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        settingsFallback: fallbackSettings,
      });

      const result = await paypalPaymentService.config();

      expect(result.settings).toEqual(fallbackSettings);
    });

    test('returns undefined settings when neither the custom object nor the fallback is configured', async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(undefined as never);

      const result = await paypalPaymentService.config();

      expect(result.settings).toBeUndefined();
    });

    test('resolves userIdToken when vaulting is enabled and the CT customer has a linked PayPal customer id', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({ body: mockCtCustomer } as never);
      (CommonConnect.generateUserIdToken as jest.Mock).mockResolvedValue('id-token' as never);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).toHaveBeenCalledWith('paypal-customer-id');
      expect(result.userIdToken).toBe('id-token');
    });

    test('does not resolve userIdToken when vaulting is disabled', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test('does not resolve userIdToken when the cart has no customerId', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCart);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test('does not resolve userIdToken when the CT customer has no PayPalUserId', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({ body: { ...mockCtCustomer, custom: undefined } } as never);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test('returns undefined userIdToken when the PayPal call fails', async () => {
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({ body: mockCtCustomer } as never);
      (CommonConnect.generateUserIdToken as jest.Mock).mockRejectedValue(new Error('PayPal is down') as never);

      const result = await paypalPaymentService.config();

      expect(result.userIdToken).toBeUndefined();
    });

    test('falls back to configured sdkOptions when the cart has no currency or country', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        totalPrice: undefined,
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      expect(result.sdkOptions).toEqual({
        PayPal: {
          standard: { enableFunding: 'paylater' },
          express: { enableFunding: 'paylater' },
        },
      });
    });

    test("overlays the cart's currency and country onto every sdkOptions component slice", async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        country: 'US',
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      expect(result.sdkOptions).toEqual({
        PayPal: {
          standard: { enableFunding: 'paylater', currency: 'USD', buyerCountry: 'US' },
          express: { enableFunding: 'paylater', currency: 'USD', buyerCountry: 'US' },
        },
        CardFields: { currency: 'USD', buyerCountry: 'US' },
      });
    });

    test("cart-derived currency/country override processor-configured sdkOptions per component", async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        country: 'US',
      } as unknown as Cart);
      jest.spyOn(ConfigModule, 'getConfig').mockReturnValue({
        ...ConfigModule.getConfig(),
        sdkOptions: {
          PayPal: {
            standard: { enableFunding: 'paylater', currency: 'EUR', buyerCountry: 'DE' },
            express: { enableFunding: 'venmo', currency: 'EUR' },
          },
          CardFields: { currency: 'EUR' },
        },
      });

      const result = await paypalPaymentService.config();

      expect(result.sdkOptions).toEqual({
        PayPal: {
          standard: { enableFunding: 'paylater', currency: 'USD', buyerCountry: 'US' },
          express: { enableFunding: 'venmo', currency: 'USD', buyerCountry: 'US' },
        },
        CardFields: { currency: 'USD', buyerCountry: 'US' },
      });
    });

    test('resolves with stored payment methods disabled and unmodified sdkOptions when the cart fetch fails', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockRejectedValue(new Error('cart is gone') as never);

      const result = await paypalPaymentService.config();

      expect(result.storedPaymentMethodsConfig).toEqual({ isEnabled: false });
      expect(result.sdkOptions).toEqual({
        PayPal: {
          standard: { enableFunding: 'paylater' },
          express: { enableFunding: 'paylater' },
        },
      });
    });
  });

  describe('getStoredPaymentMethods', () => {
    const mockCartWithCustomer = { ...mockCart, customerId: 'ct-customer-id' } as unknown as Cart;

    const mockPaymentToken = {
      id: 'paypal-token-id',
      payment_source: {
        card: {
          last_digits: '4242',
          brand: 'VISA',
          expiry: '2027-08',
        },
      },
    };

    test('returns empty when the cart has no customerId', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCart);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
      expect(CommonConnect.getPaymentTokens).not.toHaveBeenCalled();
    });

    test('returns empty when the CT customer has no PayPalUserId', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCartWithCustomer);
      mockCustomerGetExecute.mockResolvedValue({ body: { ...mockCtCustomer, custom: undefined } } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
      expect(CommonConnect.getPaymentTokens).not.toHaveBeenCalled();
    });

    test('maps PayPal card tokens to stored payment methods, falling back to request time for createdAt', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [mockPaymentToken],
      } as never);
      jest.spyOn(paymentSDK.ctPaymentMethodService, 'find').mockResolvedValue({ results: [] } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(CommonConnect.getPaymentTokens).toHaveBeenCalledWith('paypal-customer-id');
      expect(result.storedPaymentMethods).toHaveLength(1);
      expect(result.storedPaymentMethods[0]).toMatchObject({
        id: 'paypal-token-id',
        type: 'card',
        token: 'paypal-token-id',
        isDefault: false,
        displayOptions: { endDigits: '4242', brand: { key: 'VISA' }, expiryMonth: 8, expiryYear: 2027 },
      });
      expect(typeof result.storedPaymentMethods[0].createdAt).toBe('string');
    });

    test('uses the commercetools PaymentMethod record createdAt when one exists', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [mockPaymentToken],
      } as never);
      jest.spyOn(paymentSDK.ctPaymentMethodService, 'find').mockResolvedValue({
        results: [
          {
            id: 'ct-payment-method-id',
            version: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            token: { value: mockPaymentToken.id },
          },
        ],
      } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result.storedPaymentMethods[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    test('looks up commercetools PaymentMethod records once for all card tokens, not once per token', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [mockPaymentToken, { ...mockPaymentToken, id: 'paypal-token-id-2' }],
      } as never);
      const findSpy = jest.spyOn(paymentSDK.ctPaymentMethodService, 'find').mockResolvedValue({ results: [] } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result.storedPaymentMethods).toHaveLength(2);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });

    test('returns empty when the PayPal call fails', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockRejectedValue(new Error('PayPal is down') as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
    });
  });

  describe('deleteStoredPaymentMethod', () => {
    test('deletes the token from PayPal and mirrors the cleanup onto commercetools when a record exists', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);
      (CommonConnect.deletePaymentToken as jest.Mock).mockResolvedValue({ status: 'success' } as never);
      jest.spyOn(paymentSDK.ctPaymentMethodService, 'getByTokenValue').mockResolvedValue({
        id: 'ct-payment-method-id',
        version: 1,
      } as never);
      const deleteSpy = jest.spyOn(paymentSDK.ctPaymentMethodService, 'delete').mockResolvedValue({} as never);

      await paypalPaymentService.deleteStoredPaymentMethod('paypal-token-id');

      // Fire-and-forget cleanup — flush pending microtasks before asserting.
      await new Promise(process.nextTick);

      expect(CommonConnect.deletePaymentToken).toHaveBeenCalledWith('paypal-token-id');
      expect(deleteSpy).toHaveBeenCalledWith({ customerId: 'ct-customer-id', id: 'ct-payment-method-id', version: 1 });
    });

    test('does not attempt a mirror cleanup when no matching commercetools record exists', async () => {
      jest.spyOn(paymentSDK.ctCartService, 'getCart').mockResolvedValue({
        ...mockCart,
        customerId: 'ct-customer-id',
      } as unknown as Cart);
      (CommonConnect.deletePaymentToken as jest.Mock).mockResolvedValue({ status: 'success' } as never);
      jest.spyOn(paymentSDK.ctPaymentMethodService, 'getByTokenValue').mockRejectedValue(new Error('not found') as never);
      const deleteSpy = jest.spyOn(paymentSDK.ctPaymentMethodService, 'delete').mockResolvedValue({} as never);

      await paypalPaymentService.deleteStoredPaymentMethod('paypal-token-id');
      await new Promise(process.nextTick);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    test('rethrows when the PayPal delete fails, without attempting a mirror cleanup', async () => {
      (CommonConnect.deletePaymentToken as jest.Mock).mockRejectedValue(new Error('PayPal is down') as never);
      const getByTokenValueSpy = jest.spyOn(paymentSDK.ctPaymentMethodService, 'getByTokenValue');

      await expect(paypalPaymentService.deleteStoredPaymentMethod('paypal-token-id')).rejects.toThrow('PayPal is down');

      expect(getByTokenValueSpy).not.toHaveBeenCalled();
    });
  });
});
