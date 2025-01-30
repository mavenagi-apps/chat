export class JsonFetchError extends Error {
  constructor(
    message: string,
    public response: Response,
  ) {
    super(message);
  }
}

// type NoOutput = undefined;
export async function jsonFetch<T = any | never>(
  url: string | URL,
  init?: RequestInit,
): Promise<T | undefined> {
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
      `Failed to fetch ${method}(${response.status}) ${new URL(url).pathname} ${await response.text()}`,
      response,
    );
  }

  if (
    response.headers.get("content-type")?.includes("application/json") &&
    Number.parseInt(response.headers.get("content-length") ?? "0") > 0
  ) {
    return (await response.json()) as T;
  }
  return undefined;
}
