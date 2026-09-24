import { embeddFraudNet } from "./fraudNetIntegration";
import { cleanup, screen } from "@testing-library/react";
import loadScript from "../../app/loadScript";

const dummyMerchantId = "123";
const dummyPage = "home-page";
const dummySetId = (id: string | undefined) => {};
const dummySandbox = true;

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  cleanup();
});

test("Fraudnet script integration is called", () => {
  const result = embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  expect(result).toBeTruthy();
});

test("Nosript is integrated immediately", async () => {
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  const noscriptImage = screen.getAllByRole("img");
  expect(noscriptImage.length).toEqual(1);
});

test("Fraudnet config script is integrated immediately", async () => {
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  const scripts = document.querySelectorAll("script");
  expect(scripts.length).toEqual(1);
});

jest.mock("../../app/loadScript");
test("Load script is called on fraudnetIntegration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  expect(loadScript).toHaveBeenCalledTimes(1);
});

test("Load script is called on each fraudnet Integrarion", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  expect(loadScript).toHaveBeenCalledTimes(2);
});

test("There is only one fncls script after multiple calls of fraudnet integration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  const scripts = document.querySelectorAll("script");
  expect(scripts.length).toEqual(1);
});

test("There is only one fraudnet noscript script after multiple calls of fraudnet integration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, dummySandbox);
  const noscriptImage = screen.getAllByRole("img");
  expect(noscriptImage.length).toEqual(1);
});

test.each([true, false])(
  "Fraudnet config script carries sandbox=%s",
  async (sandbox) => {
    (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
    await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId, sandbox);
    const fnclsScript = document.querySelector("script[fncls]");
    expect(JSON.parse(fnclsScript?.textContent ?? "{}").sandbox).toBe(sandbox);
  }
);
