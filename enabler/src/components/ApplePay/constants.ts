import {
  testParams,
  testRequestHeader,
  testOptions,
  testVaultParams,
} from "../../constants";

export const applePayTestParams = {
  ...testParams,
  requestHeader: testRequestHeader,
  options: {
    ...testOptions,
    components: "applepay,buttons",
    buyerCountry: "US",
  },
  ...testVaultParams,
  applePayDisplayName: "My Store",
};
export const DEVICE_ERROR = "This device does not support Apple Pay";

export const CARD_FIELDS: string =
  "w-full p-3 mt-1.5 mb-4 h-10 text-base bg-white text-neutral-700 border border-gray-300 rounded box-border resize-y";

export const BUTTON: string =
  "float-right text-center whitespace-nowrap inline-block font-normal align-middle select-none cursor-pointer text-white text-base rounded py-1.5 px-3 bg-sky-500 border-sky-500";
