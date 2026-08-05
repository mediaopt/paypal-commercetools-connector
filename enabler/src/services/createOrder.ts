import { makeRequest } from "../api";

import {
  RequestHeader,
  CreateOrderRequest,
  CreateOrderResponse,
  CreatePayPalOrderData,
} from "../types";

export const createOrder = async (
  requestHeader: RequestHeader,
  url: string,
  paymentId: string,
  paymentVersion: number,
  orderData?: CreatePayPalOrderData,
) => {
  try {
    const data: CreateOrderRequest = {
      paymentId,
      paymentVersion,
      orderData,
    };

    return await makeRequest<CreateOrderResponse, CreateOrderRequest>(
      requestHeader,
      url,
      "POST",
      data,
    );
  } catch (error) {
    console.warn(error);
    return false;
  }
};
