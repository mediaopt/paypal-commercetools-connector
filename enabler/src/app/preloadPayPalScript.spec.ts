let capturedElement: any;
const mockRender = jest.fn((element: any) => {
  capturedElement = element;
});
const mockUnmount = jest.fn();
const mockRoot = { render: mockRender, unmount: mockUnmount };
const mockCreateRoot = jest.fn((container?: Element) => mockRoot);

jest.mock("react-dom/client", () => ({
  createRoot: (container: any) => mockCreateRoot(container),
}));

// preloadPayPalScript deliberately renders the real <PayPalScriptProvider>/<ScriptReadySignal>
// element tree so react-paypal-js's own loadScript()/findScript() de-dup is what actually loads
// the SDK — see the module's own comment. Mocking createRoot (same pattern as
// PayPalBuilder.spec.ts) means that tree is never really mounted, so these tests exercise
// preloadPayPalScript's own wiring (host element, caching, promise settlement) by reaching into
// the captured element tree and invoking ScriptReadySignal's onSettled prop directly, rather than
// driving a real usePayPalScriptReducer() state transition.
import {
  preloadPayPalScript,
  resetPayPalScriptPreloadCache,
} from "./preloadPayPalScript";

const getOnSettled = (): ((error?: unknown) => void) =>
  capturedElement.props.children.props.onSettled;

describe("preloadPayPalScript", () => {
  beforeEach(() => {
    resetPayPalScriptPreloadCache();
    capturedElement = undefined;
    mockRender.mockClear();
    mockCreateRoot.mockClear();
    mockUnmount.mockClear();
    document.body.innerHTML = "";
  });

  it("appends a hidden host element to the body and renders PayPalScriptProvider with the given options", () => {
    preloadPayPalScript({ clientId: "abc" } as any);

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    const host = mockCreateRoot.mock.calls[0][0] as HTMLElement;
    expect(document.body.contains(host)).toBe(true);
    expect(host.style.display).toBe("none");
    expect(capturedElement.props.options).toEqual({ clientId: "abc" });
  });

  it("resolves once the script provider reports the script resolved", async () => {
    const promise = preloadPayPalScript({ clientId: "abc" } as any);

    getOnSettled()();

    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects with the reported error once the script provider reports it rejected", async () => {
    const promise = preloadPayPalScript({ clientId: "abc" } as any);

    getOnSettled()(new Error("PayPal JS SDK script failed to load"));

    await expect(promise).rejects.toThrow(
      "PayPal JS SDK script failed to load"
    );
  });

  it("returns the same, already-in-flight promise for options that serialize identically, without rendering again", () => {
    const first = preloadPayPalScript({
      clientId: "abc",
      currency: "USD",
    } as any);
    // A different object reference with the same content — this is exactly what happens across
    // PayPalPaymentEnabler._Setup() re-runs (e.g. Checkout re-triggering setup on a payment-method
    // switch) when nothing about the config actually changed.
    const second = preloadPayPalScript({
      clientId: "abc",
      currency: "USD",
    } as any);

    expect(second).toBe(first);
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });

  it("preloads again for options that serialize differently", () => {
    preloadPayPalScript({ clientId: "abc" } as any);
    preloadPayPalScript({ clientId: "xyz" } as any);

    expect(mockCreateRoot).toHaveBeenCalledTimes(2);
  });

  it("disposes a superseded, already-settled preload's root and host element", async () => {
    preloadPayPalScript({ clientId: "abc" } as any);
    const firstHost = mockCreateRoot.mock.calls[0][0] as HTMLElement;
    getOnSettled()();

    preloadPayPalScript({ clientId: "xyz" } as any);
    await new Promise(process.nextTick);

    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(document.body.contains(firstHost)).toBe(false);
    const secondHost = mockCreateRoot.mock.calls[1][0] as HTMLElement;
    expect(document.body.contains(secondHost)).toBe(true);
  });

  it("keeps a superseded, still-pending preload mounted until it settles", async () => {
    const first = preloadPayPalScript({ clientId: "abc" } as any);
    const firstOnSettled = getOnSettled();
    const firstHost = mockCreateRoot.mock.calls[0][0] as HTMLElement;

    preloadPayPalScript({ clientId: "xyz" } as any);
    await new Promise(process.nextTick);
    expect(mockUnmount).not.toHaveBeenCalled();
    expect(document.body.contains(firstHost)).toBe(true);

    firstOnSettled(new Error("PayPal JS SDK script failed to load"));
    await expect(first).rejects.toThrow();
    await new Promise(process.nextTick);

    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(document.body.contains(firstHost)).toBe(false);
  });

  it("resetPayPalScriptPreloadCache clears the cache so identical options preload again", () => {
    preloadPayPalScript({ clientId: "abc" } as any);

    resetPayPalScriptPreloadCache();
    preloadPayPalScript({ clientId: "abc" } as any);

    expect(mockCreateRoot).toHaveBeenCalledTimes(2);
  });
});
