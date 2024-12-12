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
  { method = "GET", body, headers, ...rest }: RequestInit,
) {
  const init: RequestInit = {
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
    init.body = JSON.stringify(body);
  }
  const response = await fetch(url, init);
  if (!response.ok) {
    // throw an error and provide the response so the caller handle
    throw new JsonFetchError(
      `Failed to fetch ${method} ${new URL(url).pathname}`,
      response,
    );
  }
  return (await response.json()) as T;
}
