import { makeRequest } from "../api";

import { GetUserInfoResponse, RequestHeader } from "../types";

export const getUserInfo = async (
  requestHeader: RequestHeader,
  url: string
) => {
  try {
    const result = await makeRequest<GetUserInfoResponse, {}>(
      requestHeader,
      url,
      "GET"
    );

    return result;
  } catch (error) {
    console.warn(error);
    return false;
  }
};
