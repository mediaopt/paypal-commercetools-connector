import { RequestHeader } from "../types";

export const makeRequest = <ResponseType, T>(
  requestHeader: RequestHeader,
  url: string,
  method?: string,
  data?: T
) => {
  let headers: Headers = new Headers({
    ...requestHeader,
    "Content-Type": "application/json",
  });

  const requestData: RequestInit = {
    method: method ?? "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    headers: headers,
  };

  if (data) {
    requestData.body = JSON.stringify(data);
  }

  return fetch(url, requestData)
    .then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        // A non-2xx response must actually reject here — otherwise it gets returned as if it
        // were a successful response body, since nothing downstream checks response.ok itself.
        // The raw processor message is dev-facing only (console.log, not user-facing copy — see
        // CLAUDE.md's i18n rule); throwing the body itself (not an Error) means every existing
        // `error instanceof Error ? error.message : t(...)` catch throughout the enabler falls
        // through to its own already-defined, translated fallback instead of surfacing this to
        // the shopper via notify().
        console.log(`Request to ${url} failed with status ${response.status}`, body);
        throw body;
      }
      return body;
    })
    .then((responseData) => {
      return responseData as ResponseType;
    });
};
