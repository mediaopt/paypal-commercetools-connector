import { makeRequest } from "../api";
import type { FUNDING_SOURCE } from "@paypal/paypal-js/types/components/funding-eligibility";
import {
  RequestHeader,
  CreateVaultSetupTokenRequest,
  CreateVaultSetupTokenResponse,
} from "../types";

export const createVaultSetupToken = async (
  requestHeader: RequestHeader,
  url: string,
  paymentSource: FUNDING_SOURCE
) => {
  try {
    const data: CreateVaultSetupTokenRequest = {
      paymentSource,
    };

    return await makeRequest<
      CreateVaultSetupTokenResponse,
      CreateVaultSetupTokenRequest
    >(requestHeader, url, "POST", data);
  } catch (error) {
    console.warn(error);
    return false;
  }
};
