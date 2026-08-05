import { makeRequest } from "../api";

import {
  CreatePaymentResponse,
  CartInformation,
  RequestHeader,
} from "../types";

export const createPayment = async (
  requestHeader: RequestHeader,
  url: string,
  cartInformation?: CartInformation, //only kept for backward compatibility with the client, should not be passed for checkout
  shippingMethodId?: string
) => {
  try {
    const result = await makeRequest<CreatePaymentResponse, {}>(
      requestHeader,
      url,
      "POST",
      { ...cartInformation, shippingMethodId: shippingMethodId }
    );

    return result;
  } catch (error) {
    console.warn(error);
    return false;
  }
};
