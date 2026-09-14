import { embeddFraudNet } from "./fraudNetIntegration";
import { cleanup, screen } from "@testing-library/react";
import loadScript from "../../app/loadScript";

const dummyMerchantId = "123";
const dummyPage = "home-page";
const dummySetId = (id: string | undefined) => {};

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  cleanup();
});

test("Fraudnet script integration is called", () => {
  const result = embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  expect(result).toBeTruthy();
});

test("Nosript is integrated immediately", async () => {
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  const noscriptImage = screen.getAllByRole("img");
  expect(noscriptImage.length).toEqual(1);
});

test("Fraudnet config script is integrated immediately", async () => {
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  const scripts = document.querySelectorAll("script");
  expect(scripts.length).toEqual(1);
});

jest.mock("../../app/loadScript");
test("Load script is called on fraudnetIntegration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  expect(loadScript).toBeCalledTimes(1);
});

test("Load script is called on each fraudnet Integrarion", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  expect(loadScript).toBeCalledTimes(2);
});

test("There is only one fncls script after multiple calls of fraudnet integration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  const scripts = document.querySelectorAll("script");
  expect(scripts.length).toEqual(1);
});

test("There is only one fraudnet noscript script after multiple calls of fraudnet integration", async () => {
  (loadScript as jest.Mock).mockReturnValue(Promise.resolve());
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  await embeddFraudNet(dummyMerchantId, dummyPage, dummySetId);
  const noscriptImage = screen.getAllByRole("img");
  expect(noscriptImage.length).toEqual(1);
});
