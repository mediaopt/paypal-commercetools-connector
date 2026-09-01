// Wraps a full-page navigation so it can be swapped for a jest.fn() in tests
export const redirectTo = (url: string): void => {
  window.location.href = url;
};
