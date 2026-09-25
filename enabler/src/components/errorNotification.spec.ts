import "../messages/i18n";
import i18n from "i18next";
import { errorFunc } from "./errorNotification";

describe("errorFunc", () => {
  it("resolves a known payPal.* translation key and returns it as the GenericError code", () => {
    const isLoading = jest.fn();
    const notify = jest.fn();

    const result = errorFunc(
      { message: "generalError" },
      isLoading,
      notify,
      i18n.t.bind(i18n)
    );

    expect(isLoading).toHaveBeenCalledWith(false);
    expect(notify).toHaveBeenCalledWith(
      "Error",
      "Something went wrong. Please check your data and try again."
    );
    expect(result).toEqual({
      code: "generalError",
      message: "Something went wrong. Please check your data and try again.",
    });
  });

  it("falls back to interface.generalError when the raw message isn't a known translation key, but keeps it as the code", () => {
    const isLoading = jest.fn();
    const notify = jest.fn();

    const result = errorFunc(
      { message: "somethingNeverTranslated" },
      isLoading,
      notify,
      i18n.t.bind(i18n)
    );

    expect(notify).toHaveBeenCalledWith(
      "Error",
      "Something went wrong. Please try again later."
    );
    expect(result).toEqual({
      code: "somethingNeverTranslated",
      message: "Something went wrong. Please try again later.",
    });
  });

  it("falls back to UNKNOWN_ERROR as the code when the raw error has no string message", () => {
    const isLoading = jest.fn();
    const notify = jest.fn();

    const result = errorFunc({}, isLoading, notify, i18n.t.bind(i18n));

    expect(result).toEqual({
      code: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  });
});
