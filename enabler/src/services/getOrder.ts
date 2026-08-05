import { makeRequest } from "../api";

import {
  RequestHeader,
  CreateOrderRequest,
  CreateOrderResponse,
} from "../types";

export const getOrder = async (
  requestHeader: RequestHeader,
  url: string,
  paymentId: string,
  paymentVersion: number
) => {
  try {
    const data: CreateOrderRequest = {
      paymentId,
      paymentVersion,
    };

    return await makeRequest<CreateOrderResponse, CreateOrderRequest>(
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
