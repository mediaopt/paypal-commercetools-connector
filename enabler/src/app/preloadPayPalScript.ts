import { FC, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

/**
 * Loads the PayPal JS SDK exactly once per checkout page, before any payment component ever mounts
 * to prevent the concurrence between different PayPal scripts.
 * Shared for standard components, separate for Express (as it is supposed
 * to be used on different pages).
 * Not needed for stored - it renders by ct and operates through processor.
 */

const ScriptReadySignal: FC<{ onSettled: (error?: unknown) => void }> = ({
  onSettled,
}) => {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer();

  useEffect(() => {
    if (isResolved) {
      onSettled();
    } else if (isRejected) {
      onSettled(new Error("PayPal JS SDK script failed to load"));
    }
    // onSettled is a stable resolve/reject pair captured once per preloadPayPalScript() call —
    // this effect only needs to react to the script's own loading-status transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResolved, isRejected]);

  return null;
};

let cached: { optionsKey: string; promise: Promise<void> } | null = null;

/**
 * Idempotent per unique `options` value: PayPalPaymentEnabler._Setup() can run more than once per
 * page (e.g. Checkout re-triggering setup on a payment-method switch), and re-preloading with the
 * same options would otherwise mount a second, redundant persistent provider for no reason — the
 * cache returns the same in-flight/settled promise instead. A genuinely different `options` value
 * across such re-runs (e.g. the cart's currency changed) falls through to a fresh preload.
 */
export const preloadPayPalScript = (
  options: ReactPayPalScriptOptions
): Promise<void> => {
  const optionsKey = JSON.stringify(options);
  if (cached?.optionsKey === optionsKey) {
    return cached.promise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const host = document.createElement("div");
    host.style.display = "none";
    document.body.appendChild(host);

    const root = createRoot(host);
    root.render(
      createElement(
        PayPalScriptProvider,
        { options },
        createElement(ScriptReadySignal, {
          onSettled: (error?: unknown) => (error ? reject(error) : resolve()),
        })
      )
    );
  });

  cached = { optionsKey, promise };
  return promise;
};

/** Test-only: module-level cache would otherwise leak between cases. */
export const resetPayPalScriptPreloadCache = (): void => {
  cached = null;
};
