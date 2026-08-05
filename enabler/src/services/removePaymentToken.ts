import { makeRequest } from "../api";

import {
  GetUserInfoResponse,
  RequestHeader,
  RemovePaymentTokenRequest,
} from "../types";

export const removePaymentToken = async (
  requestHeader: RequestHeader,
  url: string,
  paymentTokenId: string
) => {
  try {
    const data: RemovePaymentTokenRequest = { paymentTokenId };
    const result = await makeRequest<GetUserInfoResponse, {}>(
      requestHeader,
      url,
      "POST",
      data
    );

    return result;
  } catch (error) {
    console.warn(error);
    return false;
  }
};
