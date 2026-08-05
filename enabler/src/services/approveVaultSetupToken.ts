import { makeRequest } from "../api";
import {
  RequestHeader,
  ApproveVaultSetupTokenRequest,
  ApproveVaultSetupTokenResponse,
} from "../types";

export const approveVaultSetupToken = async (
  requestHeader: RequestHeader,
  url: string,
  vaultSetupToken: string
) => {
  try {
    const data: ApproveVaultSetupTokenRequest = {
      vaultSetupToken,
    };

    return await makeRequest<
      ApproveVaultSetupTokenResponse,
      ApproveVaultSetupTokenRequest
    >(requestHeader, url, "POST", data);
  } catch (error) {
    console.warn(error);
    return false;
  }
};
