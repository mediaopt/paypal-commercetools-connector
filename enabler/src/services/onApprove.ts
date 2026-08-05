import { makeRequest } from "../api";

import { RequestHeader, OnApproveRequest, OnApproveResponse } from "../types";

export const onApprove = async (
  requestHeader: RequestHeader,
  url: string,
  paymentId: string,
  paymentVersion: number,
  orderID: string,
  saveCard?: boolean
) => {
  try {
    const data: OnApproveRequest = {
      paymentId,
      paymentVersion,
      orderID,
      saveCard,
    };

    return await makeRequest<OnApproveResponse, OnApproveRequest>(
      requestHeader,
      url,
      "POST",
      data
    );
  } catch (error) {
    console.warn(error);
    return false;
  }
};
