import { makeRequest } from "./request";

describe("makeRequest", () => {
  const requestHeader = { "X-Session-Id": "test" };
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  test("resolves with the parsed body on a 200 response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "order-id" }),
    } as Response);

    const result = await makeRequest(requestHeader, "https://processor.example.com/payments", "POST");

    expect(result).toEqual({ id: "order-id" });
  });

  test("rejects with the raw error body (not an Error) on a non-2xx response, instead of resolving with it as success", async () => {
    const errorBody = { statusCode: 400, error: "Bad Request", message: "stale payment version" };
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve(errorBody),
    } as Response);

    const rejection = await makeRequest(
      requestHeader,
      "https://processor.example.com/payments/3ds",
      "POST",
    ).catch((error) => error);

    // Not an Error instance — every existing `error instanceof Error ? error.message : t(...)`
    // catch throughout the enabler must fall through to its own translated fallback, not this
    // raw processor text.
    expect(rejection).not.toBeInstanceOf(Error);
    expect(rejection).toEqual(errorBody);
  });

  test("logs the failure via console.log rather than letting it reach a user-facing notification", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "stale payment version" }),
    } as Response);

    await makeRequest(requestHeader, "https://processor.example.com/payments/3ds", "POST").catch(() => {});

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("failed with status 400"),
      expect.objectContaining({ message: "stale payment version" }),
    );
    logSpy.mockRestore();
  });

  test("omits Content-Type when no data is sent, e.g. a bodyless DELETE — Fastify rejects application/json with an empty body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    await makeRequest(requestHeader, "https://processor.example.com/stored-payment-methods/token-id", "DELETE");

    const [, requestInit] = mockFetch.mock.calls[0];
    expect(requestInit.body).toBeUndefined();
    expect((requestInit.headers as Headers).has("Content-Type")).toBe(false);
  });

  test("still sends Content-Type when data is sent", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    await makeRequest(requestHeader, "https://processor.example.com/payments", "POST", { foo: "bar" });

    const [, requestInit] = mockFetch.mock.calls[0];
    expect((requestInit.headers as Headers).get("Content-Type")).toBe("application/json");
  });
});
