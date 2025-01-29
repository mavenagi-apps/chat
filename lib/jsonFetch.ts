export class JsonFetchError extends Error {
  constructor(
    message: string,
    public response: Response,
  ) {
    super(message);
  }
}

export async function jsonFetch<T = any>(
  url: string | URL,
  init?: RequestInit,
) {
  const { method = "GET", body, headers, ...rest } = init ?? {};
  const requestInit: RequestInit = {
    method,
    headers: {
      ...(headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : Array.isArray(headers)
          ? Object.fromEntries(headers)
          : headers),
      "Content-Type": "application/json",
    },
    ...rest,
  };
  if (body) {
    requestInit.body = body;
  }
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    // throw an error and provide the response so the caller handle
    throw new JsonFetchError(
      `Failed to fetch ${method} ${new URL(url).pathname}`,
      response,
    );
  }
  return (await response.json()) as T;
}
