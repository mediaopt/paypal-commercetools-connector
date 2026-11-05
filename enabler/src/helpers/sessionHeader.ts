// No X-Session-Id without a session (PayPal Express before the merchant's session has a cart)
export const sessionHeader = (sessionId?: string) => ({
  "Content-Type": "application/json",
  ...(sessionId && { "X-Session-Id": sessionId }),
});
