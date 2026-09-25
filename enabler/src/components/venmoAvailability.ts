// Per https://developer.paypal.com/v5/venmo/overview: on mobile, only Safari on iOS or Chrome
// on Android are supported (the buyer needs the Venmo app installed for the app-switch flow) —
// every other mobile browser is excluded. Desktop is unrestricted: any major browser works,
// via a QR-code checkout flow instead of app-switch. Feeds both PayPalBuilder.ts's
// PayPalComponent.isAvailable() and PayPalMask.tsx's own post-mount notification check.
export const isVenmoSupported = (): boolean => {
  try {
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    if (!isIOS && !isAndroid) {
      return true;
    }
    const isChrome =
      /Chrome|CriOS/i.test(userAgent) &&
      !/Edg|OPR|SamsungBrowser/i.test(userAgent);
    const isSafari =
      /Safari/i.test(userAgent) &&
      !/Chrome|CriOS|Edg|OPR|SamsungBrowser|FxiOS/i.test(userAgent);
    const supported = (isIOS && isSafari) || (isAndroid && isChrome);
    if (!supported) {
      console.warn("Venmo browser not supported");
    }
    return supported;
  } catch (error) {
    console.warn("Venmo availability check threw", error);
    return false;
  }
};
