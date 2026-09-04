// Native Apple Pay JS API check — Safari/WebKit exposes window.ApplePaySession only on supported
// devices/browsers, and canMakePayments() further confirms the device itself can present the
// payment sheet. This is the device/browser-capability half of ApplePayMask.tsx's own eligibility
// check — the other half (PayPal-backend applepay.config().isEligible) needs the PayPal JS SDK
// already loaded, which hasn't happened yet at this pre-mount stage, so it can't be reused here.
// Feeds both PayPalBuilder.ts's PayPalComponent.isAvailable() and ApplePayMask.tsx itself.
declare const window: any;

export const isApplePaySupported = (): boolean => {
  try {
    const supported =
      !!window.ApplePaySession && window.ApplePaySession.canMakePayments();
    if (!supported) {
      console.warn("ApplePay: browser/device not supported");
    }
    return supported;
  } catch (error) {
    console.warn("ApplePay: availability check threw", error);
    return false;
  }
};
