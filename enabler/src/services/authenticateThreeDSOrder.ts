import { makeRequest } from "../api";

import { RequestHeader } from "../types";

export const authenticateThreeDSOrder = async (
  requestHeader: RequestHeader,
  url: string,
  orderID: string,
  paymentVersion: number,
  paymentId: string,
  isGPay: boolean = false
) => {
  try {
    const data: Record<string, string | number | boolean> = {
      orderID,
      paymentVersion,
      paymentId,
      isGPay,
    };

    return await makeRequest<
      {
        version: number;
        approve: {
          liability_shift: string;
          three_d_secure: {
            enrollment_status: string;
            authentication_status: string;
          };
        };
      },
      Record<string, string | number | boolean>
    >(requestHeader, url, "POST", data);
  } catch (error) {
    console.warn(error);
    return false;
  }
};
