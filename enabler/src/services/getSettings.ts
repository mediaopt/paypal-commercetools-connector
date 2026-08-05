import { makeRequest } from "../api";

import { GetSettingsResponse, RequestHeader } from "../types";

export const getSettings = async (
  requestHeader: RequestHeader,
  url: string
) => {
  try {
    const result = await makeRequest<GetSettingsResponse, {}>(
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
