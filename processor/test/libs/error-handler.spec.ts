import { describe, test, expect, jest } from "@jest/globals";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

import { errorHandler } from "../../src/libs/fastify/error-handler";
import { CreateOrderRequestSchema } from "../../src/dtos/paypal-payment.dto";

const fakeReply = () => {
  const reply = {
    code: jest.fn(),
    send: jest.fn(),
  };
  reply.code.mockReturnValue(reply);
  return reply;
};

const errorWith = (props: { code?: string; statusCode?: number }) =>
  Object.assign(new Error("something went wrong"), props);

const handle = (error: Error) => {
  const reply = fakeReply();
  errorHandler(
    error,
    {} as FastifyRequest,
    reply as unknown as FastifyReply
  );
  return reply;
};

describe("errorHandler", () => {
  test.each(["FST_ERR_CTP_INVALID_JSON_BODY", "FST_ERR_CTP_EMPTY_JSON_BODY"])(
    "reports Fastify's %s as 400 InvalidJsonInput",
    (code) => {
      const reply = handle(errorWith({ code, statusCode: 400 }));

      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [expect.objectContaining({ code: "InvalidJsonInput" })],
        })
      );
    }
  );

  test.each([
    ["FST_ERR_NOT_FOUND", 404],
    ["FST_ERR_CTP_BODY_TOO_LARGE", 413],
    ["FST_ERR_CTP_INVALID_MEDIA_TYPE", 415],
  ])(
    "keeps the status and code of other Fastify client errors (%s → %s)",
    (code, statusCode) => {
      const reply = handle(errorWith({ code, statusCode }));

      expect(reply.code).toHaveBeenCalledWith(statusCode);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode,
          errors: [expect.objectContaining({ code })],
        })
      );
    }
  );

  test.each([
    ["a PayPal error from common-connect", { statusCode: 404 }],
    [
      "a commercetools SDK error",
      { code: "ConcurrentModification", statusCode: 409 },
    ],
  ])(
    "reports %s that only carries a 4xx statusCode as a 500",
    (_label, props) => {
      const reply = handle(errorWith(props));

      expect(reply.code).toHaveBeenCalledWith(500);
    }
  );

  describe("schema validation errors", () => {
    const buildApp = () => {
      const app = Fastify();
      app.setErrorHandler(errorHandler);
      app.post(
        "/payments/createOrder",
        { schema: { body: CreateOrderRequestSchema } },
        async () => ({ ok: true })
      );
      return app;
    };

    test("reports an unsupported enum value as one InvalidField, not invalid JSON", async () => {
      const response = await buildApp().inject({
        method: "POST",
        url: "/payments/createOrder",
        payload: { paymentId: "payment-id", paymentMethodType: "Sofort" },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.errors).toHaveLength(1);
      expect(body.errors[0]).toMatchObject({
        code: "InvalidField",
        field: "paymentMethodType",
        invalidValue: "Sofort",
      });
    });

    test("reports a body of the wrong type as InvalidField on the body", async () => {
      const response = await buildApp().inject({
        method: "POST",
        url: "/payments/createOrder",
        headers: { "content-type": "text/plain" },
        payload: "not an object",
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().errors).toEqual([
        expect.objectContaining({
          code: "InvalidField",
          field: "body",
          invalidValue: "not an object",
        }),
      ]);
    });
  });
});
