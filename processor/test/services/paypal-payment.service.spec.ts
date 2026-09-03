import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { Cart, Payment } from "@commercetools/connect-payments-sdk";

// createPayPalOrder is exported as a non-configurable ES module binding; jest.spyOn cannot
// replace it. Use jest.mock with a factory so Jest swaps the module before imports run —
// mirrors the braintree reference project's transactionSale mocking pattern.
jest.mock("common-connect", () => ({
  ...(jest.requireActual("common-connect") as object),
  createPayPalOrder: jest.fn(),
  getPayPalOrder: jest.fn(),
  authorizePayPalOrder: jest.fn(),
  capturePayPalOrder: jest.fn(),
  capturePayPalAuthorization: jest.fn(),
  getSettings: jest.fn(),
  getPaymentTokens: jest.fn(),
  deletePaymentToken: jest.fn(),
  generateUserIdToken: jest.fn(),
  updatePayPalOrder: jest.fn(),
  refundPayPalOrder: jest.fn(),
  voidPayPalAuthorization: jest.fn(),
}));
import * as CommonConnect from "common-connect";

import { paymentSDK } from "../../src/payment-sdk";
import { PayPalPaymentService } from "../../src/services/paypal-payment.service";
import { PayPalCustomerService } from "../../src/services/paypal-customer.service";
import { PayPalPaymentServiceOptions } from "../../src/services/types/paypal-payment.type";
import * as FastifyContext from "../../src/libs/fastify/context/context";
import * as ConfigModule from "../../src/config/config";

describe("paypal-payment.service", () => {
  const opts: PayPalPaymentServiceOptions = {
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
    ctPaymentMethodService: paymentSDK.ctPaymentMethodService,
    ctAPI: paymentSDK.ctAPI,
  };
  const paypalPaymentService = new PayPalPaymentService(opts);

  const mockCart = {
    id: "cart-id",
    shippingMode: "Single",
    taxCalculationMode: "LineItemLevel",
    lineItems: [],
    locale: "en-US",
    totalPrice: {
      type: "centPrecision",
      currencyCode: "USD",
      centAmount: 1000,
      fractionDigits: 2,
    },
  } as unknown as Cart;

  const mockPayment = {
    id: "payment-id",
    version: 3,
    interfaceId: undefined,
    amountPlanned: {
      type: "centPrecision",
      currencyCode: "USD",
      centAmount: 1000,
      fractionDigits: 2,
    },
    paymentMethodInfo: {},
    transactions: [],
  } as unknown as Payment;

  const mockPayPalOrder = {
    id: "paypal-order-id",
    status: "CREATED",
    payment_source: { paypal: { email_address: "buyer@example.com" } },
    links: [
      { href: "https://paypal.com/approve", rel: "approve", method: "GET" },
    ],
  };

  const mockCtCustomer = {
    id: "ct-customer-id",
    version: 1,
    custom: { fields: { PayPalUserId: "paypal-customer-id" } },
  };

  const mockShippingAddress = {
    country: "DE",
    city: "Berlin",
    postalCode: "10115",
    streetName: "Main St",
    streetNumber: "1",
    firstName: "Jane",
    lastName: "Doe",
  };

  // paymentSDK.ctAPI.client is a non-configurable getter in the SDK; save/restore manually.
  let savedClient: unknown;
  const mockClientPost = jest.fn();
  const mockClientExecute = jest.fn();
  const mockCustomerGetExecute = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .spyOn(FastifyContext, "getCartIdFromContext")
      .mockReturnValue(mockCart.id);
    jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue(mockCart);
    jest
      .spyOn(paymentSDK.ctPaymentService, "getPayment")
      .mockResolvedValue(mockPayment);
    (CommonConnect.createPayPalOrder as jest.Mock).mockResolvedValue(
      mockPayPalOrder as never
    );
    (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue(
      mockPayPalOrder as never
    );

    savedClient = paymentSDK.ctAPI.client;
    mockClientExecute.mockResolvedValue({ body: mockPayment } as never);
    mockClientPost.mockReturnValue({ execute: mockClientExecute });
    mockCustomerGetExecute.mockResolvedValue({ body: mockCtCustomer } as never);
    (paymentSDK.ctAPI as any).client = {
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({ post: mockClientPost }),
      }),
      customers: jest.fn().mockReturnValue({
        withId: jest
          .fn()
          .mockReturnValue({
            get: jest.fn().mockReturnValue({ execute: mockCustomerGetExecute }),
          }),
      }),
    };
  });

  afterEach(() => {
    (paymentSDK.ctAPI as any).client = savedClient;
    jest.restoreAllMocks();
  });

  test("creates a PayPal order and syncs interfaceId/status onto the CT payment", async () => {
    const result = await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: "CAPTURE",
        purchase_units: [
          expect.objectContaining({ invoice_id: mockPayment.id }),
        ],
        payment_source: expect.objectContaining({ paypal: expect.any(Object) }),
      })
    );

    expect(mockClientPost).toHaveBeenCalledWith({
      body: {
        version: mockPayment.version,
        actions: expect.arrayContaining([
          { action: "setInterfaceId", interfaceId: mockPayPalOrder.id },
          {
            action: "setStatusInterfaceCode",
            interfaceCode: mockPayPalOrder.status,
          },
          {
            action: "setStatusInterfaceText",
            interfaceText: mockPayPalOrder.status,
          },
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

  test("does not add a transaction to the CT payment", async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    const [{ body }] = mockClientPost.mock.calls[0] as [
      { body: { actions: { action: string }[] } }
    ];
    expect(
      body.actions.some((action) =>
        action.action.toLowerCase().includes("transaction")
      )
    ).toBe(false);
  });

  test("sets shipping_preference SET_PROVIDED_ADDRESS for a non-express order with a shipping address", async () => {
    jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
      ...mockCart,
      shippingAddress: mockShippingAddress,
    } as unknown as Cart);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: expect.objectContaining({
          paypal: expect.objectContaining({
            experience_context: { shipping_preference: "SET_PROVIDED_ADDRESS" },
          }),
        }),
      })
    );
  });

  test("does not set shipping_preference or shipping (with its shipping.type) for a PayPal Express order, even with a shipping address on the cart", async () => {
    jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
      ...mockCart,
      shippingAddress: mockShippingAddress,
    } as unknown as Cart);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
      builderType: "express" as never,
    });

    const [orderRequest] = (CommonConnect.createPayPalOrder as jest.Mock).mock
      .calls[0] as [
      {
        payment_source?: { paypal?: { experience_context?: unknown } };
        purchase_units: [{ shipping?: unknown }];
      }
    ];
    expect(
      orderRequest.payment_source?.paypal?.experience_context
    ).toBeUndefined();
    // shipping.type is always set by mapCommercetoolsAddressToPayPalAddress, and PayPal
    // rejects a later shipping.options PATCH (SHIPPING_OPTIONS_NOT_SUPPORTED) whenever
    // shipping.type is present — so Express must never set shipping at all at creation time.
    expect(orderRequest.purchase_units[0].shipping).toBeUndefined();
  });

  test("still sets shipping (with shipping.type) for a non-express order with a shipping address on the cart", async () => {
    jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
      ...mockCart,
      shippingAddress: mockShippingAddress,
    } as unknown as Cart);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    const [orderRequest] = (CommonConnect.createPayPalOrder as jest.Mock).mock
      .calls[0] as [{ purchase_units: [{ shipping?: { type?: string } }] }];
    expect(orderRequest.purchase_units[0].shipping?.type).toBe("SHIPPING");
  });

  test("forwards storeInVault/vaultId into payment_source.paypal", async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: {
        paymentSource: "paypal",
        storeInVault: true,
        vaultId: "vault-123",
      },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: {
          paypal: expect.objectContaining({
            attributes: {
              vault: { store_in_vault: "ON_SUCCESS", usage_type: "MERCHANT" },
            },
            vault_id: "vault-123",
          }),
        },
      })
    );
  });

  test("forwards storeInVault/vaultId into payment_source.card", async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: {
        paymentSource: "card",
        storeInVault: true,
        vaultId: "vault-123",
      },
    });

    expect(CommonConnect.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_source: {
          card: expect.objectContaining({
            attributes: { vault: { store_in_vault: "ON_SUCCESS" } },
            vault_id: "vault-123",
          }),
        },
      })
    );
  });

  test("attaches a returning customer's existing PayPal customer id when vaulting a new card", async () => {
    jest
      .spyOn(paymentSDK.ctCartService, "getCart")
      .mockResolvedValue({ ...mockCart, customerId: mockCtCustomer.id });

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "card", storeInVault: true },
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
      })
    );
  });

  test("does not look up the CT customer when not vaulting", async () => {
    const getCtCustomerSpy = jest.spyOn(
      PayPalCustomerService.prototype,
      "getCtCustomer"
    );
    jest
      .spyOn(paymentSDK.ctCartService, "getCart")
      .mockResolvedValue({ ...mockCart, customerId: mockCtCustomer.id });

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "card" },
    });

    expect(getCtCustomerSpy).not.toHaveBeenCalled();
  });

  test("omits payment_source for a not-yet-wired funding source", async () => {
    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "venmo" },
    });

    const [orderRequest] = (CommonConnect.createPayPalOrder as jest.Mock).mock
      .calls[0] as [Record<string, unknown>];
    expect(orderRequest.payment_source).toBeUndefined();
  });

  test("throws and does not sync the CT payment when the PayPal call fails", async () => {
    (CommonConnect.createPayPalOrder as jest.Mock).mockRejectedValue(
      new Error("PayPal is down") as never
    );

    await expect(
      paypalPaymentService.createOrder({
        paymentId: mockPayment.id,
        orderData: { paymentSource: "paypal" },
      })
    ).rejects.toThrow(
      `Failed to create PayPal order for payment ${mockPayment.id}`
    );

    expect(mockClientPost).not.toHaveBeenCalled();
  });

  test("updates interfaceId to a newly created order that differs from what was already set — e.g. the buyer reopened the popup and a fresh PayPal order was created for the same payment", async () => {
    jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
      ...mockPayment,
      interfaceId: "stale-earlier-order-id",
    } as Payment);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    const [{ body }] = mockClientPost.mock.calls[0] as [
      { body: { actions: { action: string; interfaceId?: string }[] } }
    ];
    expect(body.actions).toContainEqual({
      action: "setInterfaceId",
      interfaceId: mockPayPalOrder.id,
    });
  });

  test("does not re-set interfaceId when it already matches the created order", async () => {
    jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
      ...mockPayment,
      interfaceId: mockPayPalOrder.id,
    } as Payment);

    await paypalPaymentService.createOrder({
      paymentId: mockPayment.id,
      orderData: { paymentSource: "paypal" },
    });

    const [{ body }] = mockClientPost.mock.calls[0] as [
      { body: { actions: { action: string }[] } }
    ];
    expect(
      body.actions.some((action) => action.action === "setInterfaceId")
    ).toBe(false);
  });

  describe("authorizeOrder", () => {
    const mockAuthorizedOrder = {
      id: "paypal-order-id",
      status: "COMPLETED",
      purchase_units: [
        {
          payments: { authorizations: [{ id: "auth-id", status: "CREATED" }] },
        },
      ],
    };

    beforeEach(() => {
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue(
        mockAuthorizedOrder as never
      );
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        status: "APPROVED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);
    });

    test("adds an Authorization transaction and syncs status", async () => {
      await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({ type: "Authorization" }),
        })
      );
    });

    test("links the vaulted card's PayPal customer id to the CT customer", async () => {
      const linkSpy = jest
        .spyOn(PayPalCustomerService.prototype, "linkPayPalCustomerId")
        .mockResolvedValue();
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        customer: { typeId: "customer", id: "ct-customer-id" },
      } as Payment);
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue({
        ...mockAuthorizedOrder,
        payment_source: {
          card: {
            attributes: {
              vault: { customer: { id: "paypal-vault-customer-id" } },
            },
          },
        },
      } as never);

      await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      expect(linkSpy).toHaveBeenCalledWith(
        "ct-customer-id",
        "paypal-vault-customer-id"
      );
    });

    test("does not attempt to link when the order was not vaulted", async () => {
      const linkSpy = jest
        .spyOn(PayPalCustomerService.prototype, "linkPayPalCustomerId")
        .mockResolvedValue();

      await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      expect(linkSpy).not.toHaveBeenCalled();
    });

    test("ignores onApprovePrefix even on the express flow — that config is expressApprove-only", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        returnUrl: "https://merchant.example.com/result",
        onApprovePrefix: "https://merchant.example.com/approve",
      });

      const result = await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
        builderType: "express" as never,
      });

      expect(result.merchantReturnUrl).toContain(
        "https://merchant.example.com/result"
      );
      expect(result.merchantReturnUrl).not.toContain(
        "https://merchant.example.com/approve"
      );
    });

    test("omits merchantReturnUrl when nothing is configured", async () => {
      const result = await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      expect(result.merchantReturnUrl).toBeUndefined();
    });

    test("keeps the transaction write isolated from audit logging — never bundles pspInteractions/customFieldValues into the same updatePayment() call as the transaction", async () => {
      await paypalPaymentService.authorizeOrder({
        paymentId: mockPayment.id,
        orderID: mockAuthorizedOrder.id,
      });

      const calls = (
        paymentSDK.ctPaymentService.updatePayment as jest.Mock
      ).mock.calls.map(([arg]) => arg as Record<string, unknown>);

      const transactionCall = calls.find((call) => "transaction" in call);
      const loggingCall = calls.find(
        (call) => "pspInteractions" in call || "customFieldValues" in call
      );

      expect(transactionCall).toBeDefined();
      expect(loggingCall).toBeDefined();
      expect(transactionCall).not.toBe(loggingCall);
      expect(transactionCall).not.toHaveProperty("pspInteractions");
      expect(transactionCall).not.toHaveProperty("customFieldValues");
      expect(loggingCall).not.toHaveProperty("transaction");
    });

    test("throws without ever calling PayPal when the order has not finished being marked APPROVED yet", async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        status: "CREATED",
      } as never);

      await expect(
        paypalPaymentService.authorizeOrder({
          paymentId: mockPayment.id,
          orderID: mockAuthorizedOrder.id,
        })
      ).rejects.toThrow();

      expect(CommonConnect.authorizePayPalOrder).not.toHaveBeenCalled();
    }, 10000);
  });

  describe("captureOrder", () => {
    const mockCapturedOrder = {
      id: "paypal-order-id",
      status: "COMPLETED",
      purchase_units: [
        { payments: { captures: [{ id: "capture-id", status: "COMPLETED" }] } },
      ],
    };

    beforeEach(() => {
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue(
        mockCapturedOrder as never
      );
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        status: "APPROVED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);
    });

    test("adds a Charge transaction and syncs status", async () => {
      await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({ type: "Charge" }),
        })
      );
    });

    test("links the vaulted card's PayPal customer id to the CT customer", async () => {
      const linkSpy = jest
        .spyOn(PayPalCustomerService.prototype, "linkPayPalCustomerId")
        .mockResolvedValue();
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        customer: { typeId: "customer", id: "ct-customer-id" },
      } as Payment);
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue({
        ...mockCapturedOrder,
        payment_source: {
          card: {
            attributes: {
              vault: { customer: { id: "paypal-vault-customer-id" } },
            },
          },
        },
      } as never);

      await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(linkSpy).toHaveBeenCalledWith(
        "ct-customer-id",
        "paypal-vault-customer-id"
      );
    });

    test("ignores onApprovePrefix even on the express flow — that config is expressApprove-only now", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        returnUrl: "https://merchant.example.com/result",
        onApprovePrefix: "https://merchant.example.com/approve",
      });

      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
        builderType: "express" as never,
      });

      expect(result.merchantReturnUrl).toContain(
        "https://merchant.example.com/result"
      );
      expect(result.merchantReturnUrl).not.toContain(
        "https://merchant.example.com/approve"
      );
      expect(result.merchantReturnUrl).toContain(
        `paymentReference=${mockPayment.id}`
      );
    });

    test("includes merchantReturnUrl built from the generic MERCHANT_RETURN_URL for a non-express call", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        returnUrl: "https://merchant.example.com/result",
        onApprovePrefix: "https://merchant.example.com/approve",
      });

      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(result.merchantReturnUrl).toContain(
        "https://merchant.example.com/result"
      );
    });

    test("omits merchantReturnUrl when nothing is configured", async () => {
      const result = await paypalPaymentService.captureOrder({
        paymentId: mockPayment.id,
        orderID: mockCapturedOrder.id,
      });

      expect(result.merchantReturnUrl).toBeUndefined();
    });
  });

  describe("expressApprove", () => {
    test("adds an Initial Authorization placeholder transaction (no interactionId) via a raw CT call, for Authorize intent", async () => {
      await paypalPaymentService.expressApprove({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        payPalIntent: "Authorize",
      });

      expect(mockClientPost).toHaveBeenCalledWith({
        body: {
          version: mockPayment.version,
          actions: [
            {
              action: "addTransaction",
              transaction: {
                type: "Authorization",
                state: "Initial",
                amount: {
                  centAmount: mockPayment.amountPlanned.centAmount,
                  currencyCode: mockPayment.amountPlanned.currencyCode,
                },
              },
            },
          ],
        },
      });
    });

    test("adds a Charge placeholder transaction for Capture intent (and when intent is omitted)", async () => {
      await paypalPaymentService.expressApprove({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        payPalIntent: "Capture",
      });

      expect(mockClientPost).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            actions: [
              expect.objectContaining({
                transaction: expect.objectContaining({ type: "Charge" }),
              }),
            ],
          }),
        })
      );
    });

    test("does not add a second placeholder when a matching Initial/no-interactionId transaction already exists", async () => {
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        transactions: [
          { type: "Charge", state: "Initial", amount: mockPayment.amountPlanned },
        ],
      } as unknown as Payment);

      await paypalPaymentService.expressApprove({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        payPalIntent: "Capture",
      });

      expect(mockClientPost).not.toHaveBeenCalled();
    });

    test("throws when the caller-supplied orderID does not belong to the payment", async () => {
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        interfaceId: "some-other-order-id",
      } as unknown as Payment);

      await expect(
        paypalPaymentService.expressApprove({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
          payPalIntent: "Capture",
        })
      ).rejects.toThrow();
      expect(mockClientPost).not.toHaveBeenCalled();
    });

    test("returns onApproveRedirectionUrl built from onApprovePrefix when configured", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        onApprovePrefix: "https://merchant.example.com/review",
      });

      const result = await paypalPaymentService.expressApprove({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        payPalIntent: "Capture",
      });

      expect(result.onApproveRedirectionUrl).toContain(
        "https://merchant.example.com/review"
      );
    });

    test("omits onApproveRedirectionUrl when nothing is configured", async () => {
      const result = await paypalPaymentService.expressApprove({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        payPalIntent: "Capture",
      });

      expect(result.onApproveRedirectionUrl).toBeUndefined();
    });
  });

  describe("settlement", () => {
    const mockAmount = {
      type: "centPrecision",
      currencyCode: "USD",
      centAmount: 1000,
      fractionDigits: 2,
    } as never;

    test("captures directly when the configured intent is Capture and nothing has been authorized", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({
        payPalIntent: "Capture",
      } as never);
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        status: "APPROVED",
      } as never);
      (CommonConnect.capturePayPalOrder as jest.Mock).mockResolvedValue({
        id: "paypal-order-id",
        status: "COMPLETED",
        purchase_units: [
          {
            payments: { captures: [{ id: "capture-id", status: "COMPLETED" }] },
          },
        ],
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: { ...mockPayment, interfaceId: "paypal-order-id" } as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.capturePayPalOrder).toHaveBeenCalledWith(
        "paypal-order-id",
        {}
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({ type: "Charge" }),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} captured successfully`,
        })
      );
    });

    test("captures the existing authorization when intent is Authorize and one already exists", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({
        payPalIntent: "Authorize",
      } as never);
      (CommonConnect.capturePayPalAuthorization as jest.Mock).mockResolvedValue(
        {
          id: "capture-id",
          status: "COMPLETED",
        } as never
      );
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: {
          ...mockPayment,
          transactions: [
            {
              type: "Authorization",
              state: "Success",
              interactionId: "auth-id",
            },
          ],
        } as unknown as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.capturePayPalAuthorization).toHaveBeenCalledWith(
        "auth-id",
        expect.objectContaining({ amount: expect.anything() })
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({ type: "Charge" }),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} captured successfully`,
        })
      );
    });

    test("authorizes when intent is Authorize and nothing has been authorized yet", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({
        payPalIntent: "Authorize",
      } as never);
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        status: "APPROVED",
      } as never);
      (CommonConnect.authorizePayPalOrder as jest.Mock).mockResolvedValue({
        id: "paypal-order-id",
        status: "CREATED",
        purchase_units: [
          {
            payments: {
              authorizations: [{ id: "auth-id", status: "CREATED" }],
            },
          },
        ],
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.settlement({
        payment: { ...mockPayment, interfaceId: "paypal-order-id" } as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.authorizePayPalOrder).toHaveBeenCalledWith(
        "paypal-order-id",
        {}
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({ type: "Authorization" }),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} authorized — call capturePayment again to capture funds`,
        })
      );
    });

    test("throws when intent is Capture, nothing has been authorized, and the payment has no interfaceId", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({
        payPalIntent: "Capture",
      } as never);

      await expect(
        paypalPaymentService.settlement({
          payment: mockPayment,
          amount: mockAmount,
        })
      ).rejects.toThrow(
        `Payment ${mockPayment.id} has no associated PayPal order to settle`
      );
    });

    test("throws when intent is Authorize, nothing has been authorized, and the payment has no interfaceId", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue({
        payPalIntent: "Authorize",
      } as never);

      await expect(
        paypalPaymentService.settlement({
          payment: mockPayment,
          amount: mockAmount,
        })
      ).rejects.toThrow(
        `Payment ${mockPayment.id} has no associated PayPal order to settle`
      );
    });
  });

  describe("refundPayment", () => {
    const mockAmount = {
      type: "centPrecision",
      currencyCode: "USD",
      centAmount: 1000,
      fractionDigits: 2,
    } as never;

    const chargeTransaction = {
      id: "charge-transaction-id",
      type: "Charge",
      state: "Success",
      interactionId: "capture-id",
      amount: {
        type: "centPrecision",
        currencyCode: "USD",
        centAmount: 1000,
        fractionDigits: 2,
      },
    };

    test("refunds the transaction matching the given transactionId", async () => {
      (CommonConnect.refundPayPalOrder as jest.Mock).mockResolvedValue({
        id: "refund-id",
        status: "COMPLETED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.refundPayment({
        payment: {
          ...mockPayment,
          transactions: [chargeTransaction],
        } as unknown as Payment,
        amount: mockAmount,
        transactionId: "charge-transaction-id",
      });

      expect(CommonConnect.refundPayPalOrder).toHaveBeenCalledWith(
        "capture-id",
        { amount: expect.anything() }
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({
            type: "Refund",
            interactionId: "refund-id",
          }),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} refunded successfully`,
        })
      );
    });

    test("falls back to the most recent successful Charge when no transactionId is given", async () => {
      (CommonConnect.refundPayPalOrder as jest.Mock).mockResolvedValue({
        id: "refund-id",
        status: "COMPLETED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.refundPayment({
        payment: {
          ...mockPayment,
          transactions: [chargeTransaction],
        } as unknown as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.refundPayPalOrder).toHaveBeenCalledWith(
        "capture-id",
        { amount: expect.anything() }
      );
      expect(result).toEqual(
        expect.objectContaining({ success: true })
      );
    });

    test("still auto-selects the Charge for a further partial refund even after a prior refund", async () => {
      // Auto-select doesn't track remaining balance itself — a caller that omits transactionId is
      // expected to pass whatever amount they intend to refund next, and PayPal validates it.
      // reversePayment (abstract-payment.service.ts) is the one caller that needs to stop once
      // nothing's left, and it uses findCapturedChargeBalance + an explicit transactionId instead.
      (CommonConnect.refundPayPalOrder as jest.Mock).mockResolvedValue({
        id: "refund-id-2",
        status: "COMPLETED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.refundPayment({
        payment: {
          ...mockPayment,
          transactions: [
            chargeTransaction,
            {
              id: "refund-transaction-id",
              type: "Refund",
              state: "Success",
              interactionId: "refund-id",
            },
          ],
        } as unknown as Payment,
        amount: mockAmount,
      });

      expect(CommonConnect.refundPayPalOrder).toHaveBeenCalledWith(
        "capture-id",
        { amount: expect.anything() }
      );
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    test("throws when no matching transaction is found for the given transactionId", async () => {
      await expect(
        paypalPaymentService.refundPayment({
          payment: { ...mockPayment, transactions: [] } as unknown as Payment,
          amount: mockAmount,
          transactionId: "does-not-exist",
        })
      ).rejects.toThrow(`TransactionId does-not-exist is not found.`);
    });

    test("throws when the matching transaction is not a successful Charge", async () => {
      await expect(
        paypalPaymentService.refundPayment({
          payment: {
            ...mockPayment,
            transactions: [
              {
                id: "auth-transaction-id",
                type: "Authorization",
                state: "Success",
                interactionId: "auth-id",
              },
            ],
          } as unknown as Payment,
          amount: mockAmount,
          transactionId: "auth-transaction-id",
        })
      ).rejects.toThrow(`TransactionId auth-transaction-id is not refundable`);
    });

    test("throws when the PayPal refund call fails", async () => {
      (CommonConnect.refundPayPalOrder as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );

      await expect(
        paypalPaymentService.refundPayment({
          payment: {
            ...mockPayment,
            transactions: [chargeTransaction],
          } as unknown as Payment,
          amount: mockAmount,
          transactionId: "charge-transaction-id",
        })
      ).rejects.toThrow(
        `refundPayment failed for payment ${mockPayment.id} with error PayPal is down`
      );
    });
  });

  describe("void", () => {
    const authorizationTransaction = {
      id: "auth-transaction-id",
      type: "Authorization",
      state: "Success",
      interactionId: "auth-id",
      amount: {
        type: "centPrecision",
        currencyCode: "USD",
        centAmount: 1000,
        fractionDigits: 2,
      },
    };

    test("voids the most recent successful authorization", async () => {
      (CommonConnect.voidPayPalAuthorization as jest.Mock).mockResolvedValue({
        id: "auth-id",
        status: "VOIDED",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.void({
        payment: {
          ...mockPayment,
          transactions: [authorizationTransaction],
        } as unknown as Payment,
      });

      expect(CommonConnect.voidPayPalAuthorization).toHaveBeenCalledWith(
        "auth-id"
      );
      expect(paymentSDK.ctPaymentService.updatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({
            type: "CancelAuthorization",
            interactionId: "auth-id",
          }),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: `Payment ${mockPayment.id} voided successfully`,
        })
      );
    });

    test("throws when no successful authorization transaction exists", async () => {
      await expect(
        paypalPaymentService.void({
          payment: { ...mockPayment, transactions: [] } as unknown as Payment,
        })
      ).rejects.toThrow(
        `No voidable transaction found for payment ${mockPayment.id}`
      );
    });

    test("does not re-select an authorization that has already been voided", async () => {
      await expect(
        paypalPaymentService.void({
          payment: {
            ...mockPayment,
            transactions: [
              authorizationTransaction,
              {
                id: "cancel-transaction-id",
                type: "CancelAuthorization",
                state: "Success",
                interactionId: "auth-id",
              },
            ],
          } as unknown as Payment,
        })
      ).rejects.toThrow(
        `No voidable transaction found for payment ${mockPayment.id}`
      );
      expect(CommonConnect.voidPayPalAuthorization).not.toHaveBeenCalled();
    });

    test("does not void an authorization that has already been captured", async () => {
      await expect(
        paypalPaymentService.void({
          payment: {
            ...mockPayment,
            transactions: [
              authorizationTransaction,
              {
                id: "charge-transaction-id",
                type: "Charge",
                state: "Success",
                interactionId: "capture-id",
                amount: {
                  type: "centPrecision",
                  currencyCode: "USD",
                  centAmount: 1000,
                  fractionDigits: 2,
                },
              },
            ],
          } as unknown as Payment,
        })
      ).rejects.toThrow(
        `No voidable transaction found for payment ${mockPayment.id}`
      );
      expect(CommonConnect.voidPayPalAuthorization).not.toHaveBeenCalled();
    });

    test("throws when the PayPal void call fails", async () => {
      (CommonConnect.voidPayPalAuthorization as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );

      await expect(
        paypalPaymentService.void({
          payment: {
            ...mockPayment,
            transactions: [authorizationTransaction],
          } as unknown as Payment,
        })
      ).rejects.toThrow(
        `void failed for payment ${mockPayment.id} with error PayPal is down`
      );
    });
  });

  describe("modifyPayment: reversePayment routing", () => {
    test("voids when the payment has not been captured yet", async () => {
      (CommonConnect.voidPayPalAuthorization as jest.Mock).mockResolvedValue({
        id: "auth-id",
        status: "VOIDED",
      } as never);
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        transactions: [
          {
            id: "auth-transaction-id",
            type: "Authorization",
            state: "Success",
            interactionId: "auth-id",
            amount: mockPayment.amountPlanned,
          },
        ],
      } as unknown as Payment);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.modifyPayment({
        paymentId: mockPayment.id,
        data: { actions: [{ action: "reversePayment" }] } as never,
      });

      expect(CommonConnect.voidPayPalAuthorization).toHaveBeenCalledWith(
        "auth-id"
      );
      expect(CommonConnect.refundPayPalOrder).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    test("refunds the captured amount, not the payment's full amountPlanned", async () => {
      // The Charge here (400 = $4.00) is a partial capture, deliberately less than
      // mockPayment.amountPlanned (1000 = $10.00) — proves the refund targets what was actually
      // captured rather than the payment's planned total.
      (CommonConnect.refundPayPalOrder as jest.Mock).mockResolvedValue({
        id: "refund-id",
        status: "COMPLETED",
      } as never);
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        transactions: [
          {
            id: "charge-transaction-id",
            type: "Charge",
            state: "Success",
            interactionId: "capture-id",
            amount: {
              type: "centPrecision",
              currencyCode: "USD",
              centAmount: 400,
              fractionDigits: 2,
            },
          },
        ],
      } as unknown as Payment);
      jest
        .spyOn(paymentSDK.ctPaymentService, "updatePayment")
        .mockResolvedValue(mockPayment);

      const result = await paypalPaymentService.modifyPayment({
        paymentId: mockPayment.id,
        data: { actions: [{ action: "reversePayment" }] } as never,
      });

      expect(CommonConnect.refundPayPalOrder).toHaveBeenCalledWith(
        "capture-id",
        { amount: { currency_code: "USD", value: "4.00" } }
      );
      expect(CommonConnect.voidPayPalAuthorization).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    test("throws when the payment has already been fully refunded", async () => {
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        transactions: [
          {
            id: "charge-transaction-id",
            type: "Charge",
            state: "Success",
            interactionId: "capture-id",
            amount: {
              type: "centPrecision",
              currencyCode: "USD",
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
          {
            id: "refund-transaction-id",
            type: "Refund",
            state: "Success",
            interactionId: "refund-id",
            amount: {
              type: "centPrecision",
              currencyCode: "USD",
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
        ],
      } as unknown as Payment);

      await expect(
        paypalPaymentService.modifyPayment({
          paymentId: mockPayment.id,
          data: { actions: [{ action: "reversePayment" }] } as never,
        })
      ).rejects.toThrow(
        `Payment ${mockPayment.id} has already been fully refunded`
      );
      expect(CommonConnect.refundPayPalOrder).not.toHaveBeenCalled();
      expect(CommonConnect.voidPayPalAuthorization).not.toHaveBeenCalled();
    });

    test("throws rather than silently under-refunding when the payment has multiple captures", async () => {
      // settlement() allows capturing an authorization in installments (PayPal captures default
      // to final_capture: false), so more than one successful Charge is possible — reversing that
      // safely would mean refunding each capture individually, which this action doesn't attempt.
      const partialCharge = {
        type: "Charge",
        state: "Success",
        amount: {
          type: "centPrecision",
          currencyCode: "USD",
          centAmount: 400,
          fractionDigits: 2,
        },
      };
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        transactions: [
          { ...partialCharge, id: "charge-1", interactionId: "capture-1" },
          { ...partialCharge, id: "charge-2", interactionId: "capture-2" },
        ],
      } as unknown as Payment);

      await expect(
        paypalPaymentService.modifyPayment({
          paymentId: mockPayment.id,
          data: { actions: [{ action: "reversePayment" }] } as never,
        })
      ).rejects.toThrow(
        `Payment ${mockPayment.id} has more than one captured Charge`
      );
      expect(CommonConnect.refundPayPalOrder).not.toHaveBeenCalled();
      expect(CommonConnect.voidPayPalAuthorization).not.toHaveBeenCalled();
    });
  });

  describe("authenticateThreeDSOrder", () => {
    test("returns the 3DS result when the PayPal order has an authentication_result", async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue({
        ...mockPayPalOrder,
        payment_source: {
          card: {
            authentication_result: {
              liability_shift: "POSSIBLE",
              three_d_secure: {
                enrollment_status: "Y",
                authentication_status: "Y",
              },
            },
          },
        },
      } as never);

      const result = await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(CommonConnect.getPayPalOrder).toHaveBeenCalledWith(
        mockPayPalOrder.id
      );
      expect(result).toEqual({
        approve: {
          liability_shift: "POSSIBLE",
          three_d_secure: {
            enrollment_status: "Y",
            authentication_status: "Y",
          },
        },
      });
    });

    test("omits approve entirely when the PayPal order has no authentication_result", async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockResolvedValue(
        mockPayPalOrder as never
      );

      const result = await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(result).toEqual({});
      expect(result).not.toHaveProperty("approve");
    });

    test("does not mutate the CT payment", async () => {
      await paypalPaymentService.authenticateThreeDSOrder({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
      });

      expect(mockClientPost).not.toHaveBeenCalled();
    });

    test("throws when orderID does not match the payment's interfaceId", async () => {
      jest.spyOn(paymentSDK.ctPaymentService, "getPayment").mockResolvedValue({
        ...mockPayment,
        interfaceId: "some-other-order-id",
      } as Payment);

      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        })
      ).rejects.toThrow(
        `Order ${mockPayPalOrder.id} does not belong to payment ${mockPayment.id}`
      );

      expect(CommonConnect.getPayPalOrder).not.toHaveBeenCalled();
    });

    test("does not throw when interfaceId is not set yet", async () => {
      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        })
      ).resolves.toBeDefined();
    });

    test("throws when the PayPal lookup fails", async () => {
      (CommonConnect.getPayPalOrder as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );

      await expect(
        paypalPaymentService.authenticateThreeDSOrder({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        })
      ).rejects.toThrow(`Failed to look up PayPal order ${mockPayPalOrder.id}`);
    });
  });

  describe("config", () => {
    test("merges settings from the CT custom object over processor's own base settings, field by field", async () => {
      const settings = { acceptPayPal: true };
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(
        settings as never
      );

      const result = await paypalPaymentService.config();

      expect(result.settings).toEqual({
        ...ConfigModule.getConfig().settingsFallback,
        ...settings,
      });
    });

    test("falls back to env-configured settings when the custom object is unavailable", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(
        undefined as never
      );
      const fallbackSettings = { acceptPayPal: false };
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        settingsFallback: fallbackSettings,
      });

      const result = await paypalPaymentService.config();

      expect(result.settings).toEqual(fallbackSettings);
    });

    test("falls back to processor's own base settings (common-connect's CUSTOM_OBJECT_DEFAULT_VALUES) when neither the custom object nor PAYPAL_SETTINGS is configured", async () => {
      (CommonConnect.getSettings as jest.Mock).mockResolvedValue(
        undefined as never
      );

      const result = await paypalPaymentService.config();

      expect(result.settings).toEqual(CommonConnect.CUSTOM_OBJECT_DEFAULT_VALUES);
    });

    test("resolves userIdToken when vaulting is enabled and the CT customer has a linked PayPal customer id", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({
        body: mockCtCustomer,
      } as never);
      (CommonConnect.generateUserIdToken as jest.Mock).mockResolvedValue(
        "id-token" as never
      );

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).toHaveBeenCalledWith(
        "paypal-customer-id"
      );
      expect(result.userIdToken).toBe("id-token");
    });

    test("does not resolve userIdToken when vaulting is disabled", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test("does not resolve userIdToken when the cart has no customerId", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCart);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test("does not resolve userIdToken when the CT customer has no PayPalUserId", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({
        body: { ...mockCtCustomer, custom: undefined },
      } as never);

      const result = await paypalPaymentService.config();

      expect(CommonConnect.generateUserIdToken).not.toHaveBeenCalled();
      expect(result.userIdToken).toBeUndefined();
    });

    test("returns undefined userIdToken when the PayPal call fails", async () => {
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        enableVaulting: true,
      });
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);
      mockCustomerGetExecute.mockResolvedValue({
        body: mockCtCustomer,
      } as never);
      (CommonConnect.generateUserIdToken as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );

      const result = await paypalPaymentService.config();

      expect(result.userIdToken).toBeUndefined();
    });

    test("falls back to configured sdkOptions when the cart has no currency or country", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        totalPrice: undefined,
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      // No processor-side enableFunding defaulting anymore — that default now lives enabler-only
      // (PayPalBuilder.ts) — and PAYPAL_SDK_OPTIONS is unset in this test env, so sdkOptions passes
      // through empty.
      expect(result.sdkOptions).toEqual({});
    });

    test("overlays the cart's currency and country onto every sdkOptions component slice", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        country: "US",
      } as unknown as Cart);

      const result = await paypalPaymentService.config();

      // Flat per-componentType overlay (StandardPaymentMethodType's members) plus the dedicated
      // PayPalExpress slot — see config.utils.ts's buildSdkOptions().
      expect(result.sdkOptions).toEqual({
        PayPal: { currency: "USD", buyerCountry: "US" },
        CardFields: { currency: "USD", buyerCountry: "US" },
        PayPalExpress: { currency: "USD", buyerCountry: "US" },
      });
    });

    test("cart-derived currency/country override processor-configured sdkOptions per component", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        country: "US",
      } as unknown as Cart);
      jest.spyOn(ConfigModule, "getConfig").mockReturnValue({
        ...ConfigModule.getConfig(),
        sdkOptions: {
          PayPal: {
            enableFunding: "paylater",
            currency: "EUR",
            buyerCountry: "DE",
          },
          PayPalExpress: { enableFunding: "venmo", currency: "EUR" },
          CardFields: { currency: "EUR" },
        },
      });

      const result = await paypalPaymentService.config();

      expect(result.sdkOptions).toEqual({
        PayPal: {
          enableFunding: "paylater",
          currency: "USD",
          buyerCountry: "US",
        },
        CardFields: { currency: "USD", buyerCountry: "US" },
        PayPalExpress: {
          enableFunding: "venmo",
          currency: "USD",
          buyerCountry: "US",
        },
      });
    });

    test("resolves with stored payment methods disabled and unmodified sdkOptions when the cart fetch fails", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockRejectedValue(new Error("cart is gone") as never);

      const result = await paypalPaymentService.config();

      expect(result.storedPaymentMethodsConfig).toEqual({ isEnabled: false });
      expect(result.sdkOptions).toEqual({});
    });
  });

  describe("getStoredPaymentMethods", () => {
    const mockCartWithCustomer = {
      ...mockCart,
      customerId: "ct-customer-id",
    } as unknown as Cart;

    const mockPaymentToken = {
      id: "paypal-token-id",
      payment_source: {
        card: {
          last_digits: "4242",
          brand: "VISA",
          expiry: "2027-08",
        },
      },
    };

    test("returns empty when the cart has no customerId", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCart);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
      expect(CommonConnect.getPaymentTokens).not.toHaveBeenCalled();
    });

    test("returns empty when the CT customer has no PayPalUserId", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCartWithCustomer);
      mockCustomerGetExecute.mockResolvedValue({
        body: { ...mockCtCustomer, custom: undefined },
      } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
      expect(CommonConnect.getPaymentTokens).not.toHaveBeenCalled();
    });

    test("maps PayPal card tokens to stored payment methods, falling back to request time for createdAt", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [mockPaymentToken],
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentMethodService, "find")
        .mockResolvedValue({ results: [] } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(CommonConnect.getPaymentTokens).toHaveBeenCalledWith(
        "paypal-customer-id"
      );
      expect(result.storedPaymentMethods).toHaveLength(1);
      expect(result.storedPaymentMethods[0]).toMatchObject({
        id: "paypal-token-id",
        type: "card",
        token: "paypal-token-id",
        isDefault: false,
        displayOptions: {
          endDigits: "4242",
          brand: { key: "VISA" },
          expiryMonth: 8,
          expiryYear: 2027,
        },
      });
      expect(typeof result.storedPaymentMethods[0].createdAt).toBe("string");
    });

    test("uses the commercetools PaymentMethod record createdAt when one exists", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [mockPaymentToken],
      } as never);
      jest.spyOn(paymentSDK.ctPaymentMethodService, "find").mockResolvedValue({
        results: [
          {
            id: "ct-payment-method-id",
            version: 1,
            createdAt: "2024-01-01T00:00:00.000Z",
            token: { value: mockPaymentToken.id },
          },
        ],
      } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result.storedPaymentMethods[0].createdAt).toBe(
        "2024-01-01T00:00:00.000Z"
      );
    });

    test("looks up commercetools PaymentMethod records once for all card tokens, not once per token", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockResolvedValue({
        payment_tokens: [
          mockPaymentToken,
          { ...mockPaymentToken, id: "paypal-token-id-2" },
        ],
      } as never);
      const findSpy = jest
        .spyOn(paymentSDK.ctPaymentMethodService, "find")
        .mockResolvedValue({ results: [] } as never);

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result.storedPaymentMethods).toHaveLength(2);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });

    test("returns empty when the PayPal call fails", async () => {
      jest
        .spyOn(paymentSDK.ctCartService, "getCart")
        .mockResolvedValue(mockCartWithCustomer);
      (CommonConnect.getPaymentTokens as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );

      const result = await paypalPaymentService.getStoredPaymentMethods();

      expect(result).toEqual({ storedPaymentMethods: [] });
    });
  });

  describe("deleteStoredPaymentMethod", () => {
    test("deletes the token from PayPal and mirrors the cleanup onto commercetools when a record exists", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);
      (CommonConnect.deletePaymentToken as jest.Mock).mockResolvedValue({
        status: "success",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentMethodService, "getByTokenValue")
        .mockResolvedValue({
          id: "ct-payment-method-id",
          version: 1,
        } as never);
      const deleteSpy = jest
        .spyOn(paymentSDK.ctPaymentMethodService, "delete")
        .mockResolvedValue({} as never);

      await paypalPaymentService.deleteStoredPaymentMethod("paypal-token-id");

      // Fire-and-forget cleanup — flush pending microtasks before asserting.
      await new Promise(process.nextTick);

      expect(CommonConnect.deletePaymentToken).toHaveBeenCalledWith(
        "paypal-token-id"
      );
      expect(deleteSpy).toHaveBeenCalledWith({
        customerId: "ct-customer-id",
        id: "ct-payment-method-id",
        version: 1,
      });
    });

    test("does not attempt a mirror cleanup when no matching commercetools record exists", async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        customerId: "ct-customer-id",
      } as unknown as Cart);
      (CommonConnect.deletePaymentToken as jest.Mock).mockResolvedValue({
        status: "success",
      } as never);
      jest
        .spyOn(paymentSDK.ctPaymentMethodService, "getByTokenValue")
        .mockRejectedValue(new Error("not found") as never);
      const deleteSpy = jest
        .spyOn(paymentSDK.ctPaymentMethodService, "delete")
        .mockResolvedValue({} as never);

      await paypalPaymentService.deleteStoredPaymentMethod("paypal-token-id");
      await new Promise(process.nextTick);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    test("rethrows when the PayPal delete fails, without attempting a mirror cleanup", async () => {
      (CommonConnect.deletePaymentToken as jest.Mock).mockRejectedValue(
        new Error("PayPal is down") as never
      );
      const getByTokenValueSpy = jest.spyOn(
        paymentSDK.ctPaymentMethodService,
        "getByTokenValue"
      );

      await expect(
        paypalPaymentService.deleteStoredPaymentMethod("paypal-token-id")
      ).rejects.toThrow("PayPal is down");

      expect(getByTokenValueSpy).not.toHaveBeenCalled();
    });
  });

  describe("updateShipping", () => {
    const mockUpdatedCart = {
      ...mockCart,
      version: 4,
      totalPrice: {
        type: "centPrecision",
        currencyCode: "USD",
        centAmount: 1200,
        fractionDigits: 2,
      },
    } as unknown as Cart;

    const mockShippingMethodResult = {
      body: {
        results: [
          {
            id: "standard",
            name: "Standard Shipping",
            isDefault: true,
            zoneRates: [
              {
                shippingRates: [
                  {
                    price: {
                      type: "centPrecision",
                      currencyCode: "USD",
                      centAmount: 500,
                      fractionDigits: 2,
                    },
                    isMatching: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const mockStandardShippingOption = {
      id: "standard",
      label: "Standard Shipping",
      type: "SHIPPING" as const,
      amount: { currency_code: "USD", value: "5.00" },
      selected: true,
    };

    const mockCartsPost = jest.fn();
    const mockCartsExecute = jest.fn();
    const mockShippingMethodsGet = jest.fn();
    const mockShippingMethodsExecute = jest.fn();

    beforeEach(() => {
      (CommonConnect.updatePayPalOrder as jest.Mock).mockResolvedValue({
        status: "success",
      } as never);
      mockCartsExecute.mockResolvedValue({ body: mockUpdatedCart } as never);
      mockCartsPost.mockReturnValue({ execute: mockCartsExecute });
      mockShippingMethodsExecute.mockResolvedValue(
        mockShippingMethodResult as never
      );
      mockShippingMethodsGet.mockReturnValue({
        execute: mockShippingMethodsExecute,
      });

      (paymentSDK.ctAPI as any).client = {
        ...(paymentSDK.ctAPI as any).client,
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({ post: mockCartsPost }),
        }),
        // updateShipping always queries matchingCart now (never matchingLocation) — the cart
        // is updated with whatever's known before this is ever called.
        shippingMethods: jest.fn().mockReturnValue({
          matchingCart: jest
            .fn()
            .mockReturnValue({ get: mockShippingMethodsGet }),
        }),
      };
    });

    test("throws when neither address nor shippingMethodId is provided", async () => {
      await expect(
        paypalPaymentService.updateShipping({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
        } as never)
      ).rejects.toThrow("requires either address or shippingMethodId");

      expect(CommonConnect.updatePayPalOrder).not.toHaveBeenCalled();
    });

    test("address change: sets the address on the cart first, resolves the default from matching-cart, then assigns it", async () => {
      const result = await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        address: {
          countryCode: "US",
          postalCode: "10001",
          city: "NYC",
          state: "NY",
        },
      });

      const shippingMethodsCall = (
        (paymentSDK.ctAPI as any).client.shippingMethods as jest.Mock
      ).mock.results[0].value as any;
      expect(shippingMethodsCall.matchingCart).toHaveBeenCalled();

      // Two cart updates: address first (no method known yet), then the resolved default.
      expect(mockCartsPost).toHaveBeenNthCalledWith(1, {
        body: {
          version: mockCart.version,
          actions: [expect.objectContaining({ action: "setShippingAddress" })],
        },
      });
      expect(mockCartsPost).toHaveBeenNthCalledWith(2, {
        body: {
          version: mockUpdatedCart.version,
          actions: [
            expect.objectContaining({
              action: "setShippingMethod",
              shippingMethod: { typeId: "shipping-method", id: "standard" },
            }),
          ],
        },
      });
      expect(mockCartsPost).toHaveBeenCalledTimes(2);

      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledWith(
        mockPayPalOrder.id,
        expect.arrayContaining([
          expect.objectContaining({
            path: "/purchase_units/@reference_id=='default'/amount",
          }),
          expect.objectContaining({
            path: "/purchase_units/@reference_id=='default'/shipping/options",
          }),
        ])
      );
      expect(result.shippingOptions).toEqual([
        expect.objectContaining({ id: "standard", selected: true }),
      ]);
    });

    test("option change: sets only the shipping method (address already on the cart), one cart update", async () => {
      const result = await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "standard",
      });

      const shippingMethodsCall = (
        (paymentSDK.ctAPI as any).client.shippingMethods as jest.Mock
      ).mock.results[0].value as any;
      expect(shippingMethodsCall.matchingCart).toHaveBeenCalled();

      expect(mockCartsPost).toHaveBeenCalledTimes(1);
      expect(mockCartsPost).toHaveBeenCalledWith({
        body: {
          version: mockCart.version,
          actions: [
            expect.objectContaining({
              action: "setShippingMethod",
              shippingMethod: { typeId: "shipping-method", id: "standard" },
            }),
          ],
        },
      });

      expect(result.shippingOptions).not.toEqual([]);
      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledWith(
        mockPayPalOrder.id,
        expect.arrayContaining([
          expect.objectContaining({
            path: "/purchase_units/@reference_id=='default'/shipping/options",
            value: result.shippingOptions,
          }),
        ])
      );
    });

    test("option change with a trustworthy client-supplied shippingOptions list skips the matchingCart query", async () => {
      const clientOptions = [
        mockStandardShippingOption,
        {
          id: "express",
          label: "Express Shipping",
          type: "SHIPPING" as const,
          amount: { currency_code: "USD", value: "15.00" },
          selected: false,
        },
      ];

      const result = await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "express",
        shippingOptions: clientOptions,
      });

      expect(
        (paymentSDK.ctAPI as any).client.shippingMethods
      ).not.toHaveBeenCalled();
      expect(mockShippingMethodsExecute).not.toHaveBeenCalled();
      expect(result.shippingOptions).toEqual([
        expect.objectContaining({ id: "standard", selected: false }),
        expect.objectContaining({ id: "express", selected: true }),
      ]);
    });

    test("option change with a client-supplied list missing the requested id falls back to matchingCart", async () => {
      // Distinguishing marker: if the (stale/wrong) client list were used instead of a fresh
      // matchingCart fetch, the result would carry this label rather than the mocked fetch's.
      const staleClientOptions = [
        { ...mockStandardShippingOption, label: "STALE CACHED LABEL" },
      ];

      const result = await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "express", // not present in staleClientOptions
        shippingOptions: staleClientOptions,
      });

      expect(result.shippingOptions).toEqual([
        expect.objectContaining({ id: "standard", label: "Standard Shipping" }),
      ]);
      const shippingMethodsCall = (
        (paymentSDK.ctAPI as any).client.shippingMethods as jest.Mock
      ).mock.results[0].value as any;
      expect(shippingMethodsCall.matchingCart).toHaveBeenCalled();
    });

    test("address change ignores any client-supplied shippingOptions and still queries matchingCart fresh", async () => {
      // Same distinguishing-marker approach as the test above.
      const staleClientOptions = [
        { ...mockStandardShippingOption, label: "STALE CACHED LABEL" },
      ];

      const result = await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        address: {
          countryCode: "US",
          postalCode: "10001",
          city: "NYC",
          state: "NY",
        },
        shippingOptions: staleClientOptions,
      });

      expect(result.shippingOptions).toEqual([
        expect.objectContaining({ id: "standard", label: "Standard Shipping" }),
      ]);
      const shippingMethodsCall = (
        (paymentSDK.ctAPI as any).client.shippingMethods as jest.Mock
      ).mock.results[0].value as any;
      expect(shippingMethodsCall.matchingCart).toHaveBeenCalled();
    });

    test("throws when no shipping methods match the cart after the address is applied", async () => {
      mockShippingMethodsExecute.mockResolvedValueOnce({
        body: { results: [] },
      } as never);

      await expect(
        paypalPaymentService.updateShipping({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
          address: { countryCode: "XX" },
        })
      ).rejects.toThrow(
        `No shipping methods available for cart ${mockCart.id}`
      );

      // The address update itself still succeeded — only the follow-up matchingCart query
      // came back empty — so only one cart update happened, and PayPal was never patched.
      expect(mockCartsPost).toHaveBeenCalledTimes(1);
      expect(CommonConnect.updatePayPalOrder).not.toHaveBeenCalled();
    });

    test("throws and does not call updatePayPalOrder when the cart update fails", async () => {
      mockCartsExecute.mockRejectedValueOnce(new Error("Conflict") as never);

      await expect(
        paypalPaymentService.updateShipping({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
          shippingMethodId: "standard",
        })
      ).rejects.toThrow();

      expect(CommonConnect.updatePayPalOrder).not.toHaveBeenCalled();
    });

    test("propagates the failure when updatePayPalOrder fails", async () => {
      (CommonConnect.updatePayPalOrder as jest.Mock).mockRejectedValueOnce(
        new Error("PayPal is down") as never
      );

      await expect(
        paypalPaymentService.updateShipping({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
          shippingMethodId: "standard",
        })
      ).rejects.toThrow();
    });

    // PayPal's PATCH endpoint rejects "replace" on a path that doesn't exist yet with
    // INVALID_PATCH_OPERATION (buildOrderRequest never sets shipping.options at order-creation
    // time). The op is guessed from the cart's own shippingInfo (present before this call's own
    // mutation) rather than asking PayPal up front; if that guess is wrong, it's simply flipped
    // to the other of the only two possible values and retried once — no lookup involved.
    const invalidPatchOperationError = Object.assign(
      new Error("Unprocessable Entity"),
      {
        response: {
          data: {
            details: [{ field: "op", issue: "INVALID_PATCH_OPERATION" }],
          },
        },
      }
    );

    test('assumes "add" when the cart had no shippingInfo before this call, without calling getPayPalOrder', async () => {
      await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "standard",
      });

      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledWith(
        mockPayPalOrder.id,
        expect.arrayContaining([
          expect.objectContaining({
            op: "add",
            path: "/purchase_units/@reference_id=='default'/shipping/options",
          }),
        ])
      );
      expect(CommonConnect.getPayPalOrder).not.toHaveBeenCalled();
    });

    test('assumes "replace" when the cart already had shippingInfo before this call, without calling getPayPalOrder', async () => {
      jest.spyOn(paymentSDK.ctCartService, "getCart").mockResolvedValue({
        ...mockCart,
        shippingInfo: { shippingMethodName: "Standard EU" },
      } as unknown as Cart);

      await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "standard",
      });

      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledWith(
        mockPayPalOrder.id,
        expect.arrayContaining([
          expect.objectContaining({
            op: "replace",
            path: "/purchase_units/@reference_id=='default'/shipping/options",
          }),
        ])
      );
      expect(CommonConnect.getPayPalOrder).not.toHaveBeenCalled();
    });

    test("flips to the corrected op and retries when the assumed op is rejected as INVALID_PATCH_OPERATION", async () => {
      (CommonConnect.updatePayPalOrder as jest.Mock)
        .mockRejectedValueOnce(invalidPatchOperationError as never)
        .mockResolvedValueOnce({ status: "success" } as never);

      await paypalPaymentService.updateShipping({
        paymentId: mockPayment.id,
        orderID: mockPayPalOrder.id,
        shippingMethodId: "standard",
      });

      expect(CommonConnect.getPayPalOrder).not.toHaveBeenCalled();
      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledTimes(2);
      expect(CommonConnect.updatePayPalOrder).toHaveBeenNthCalledWith(
        1,
        mockPayPalOrder.id,
        expect.arrayContaining([expect.objectContaining({ op: "add" })])
      );
      expect(CommonConnect.updatePayPalOrder).toHaveBeenNthCalledWith(
        2,
        mockPayPalOrder.id,
        expect.arrayContaining([expect.objectContaining({ op: "replace" })])
      );
    });

    test("throws when the retry with the corrected op also fails", async () => {
      (CommonConnect.updatePayPalOrder as jest.Mock)
        .mockRejectedValueOnce(invalidPatchOperationError as never)
        .mockRejectedValueOnce(new Error("PayPal is down") as never);

      await expect(
        paypalPaymentService.updateShipping({
          paymentId: mockPayment.id,
          orderID: mockPayPalOrder.id,
          shippingMethodId: "standard",
        })
      ).rejects.toThrow();

      expect(CommonConnect.updatePayPalOrder).toHaveBeenCalledTimes(2);
    });
  });
});
