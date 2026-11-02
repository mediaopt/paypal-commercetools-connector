import { makeRequest } from "../api";
import { RequestHeader } from "../types";

// undefined on a non-2xx answer or a network error. Logs only the URL: the error can quote the
// response body (e.g. a JSON parse error).
export async function processorRequest<T = undefined, R = any>(
  requestHeader: RequestHeader,
  url: string,
  data?: T,
  method = "POST"
): Promise<R | undefined> {
  try {
    return await makeRequest<R, T>(requestHeader, url, method, data);
  } catch {
    console.warn(`[paypal-enabler] processor request to ${url} failed`);
    return undefined;
  }
}
