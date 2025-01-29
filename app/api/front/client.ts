import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import type { Front } from "@/types/front";
import { jsonFetch, JsonFetchError } from "@/lib/jsonFetch";
import Bottleneck from "bottleneck";

export enum RetryableStatusCodes {
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export const DEFAULT_API_HOST = "https://api2.frontapp.com";

// https://dev.frontapp.com/docs/rate-limiting#standard-rate-limits
export enum StandardRateLimits {
  STARTER = 1200,
  GROWTH = 600,
  SCALE = 300,
}

function createRetryRateLimiter(minTime: number) {
  const limiter = new Bottleneck({
    minTime: minTime,
  });
  limiter.on("failed", async (error, info) => {
    if (process.env.ENABLE_API_LOGGING) {
      console.error("FRONT:: API Request failed", {
        attempt: info.retryCount,
        message: error.message,
        ...(error instanceof JsonFetchError
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              response: await error.response.text(),
            }
          : {}),
      });
    }
    const { retryCount } = info;
    const backoffs = [0.2, 0.4, 0.8, 1, 2];
    if (backoffs.length <= retryCount) {
      // stop retrying after 5 attempts
      return;
    }
    const defaultRetryAfter = backoffs[retryCount] * 1000;
    if (
      error instanceof JsonFetchError &&
      Object.values(RetryableStatusCodes).includes(error.response.status) &&
      error.response.headers.get("retry-after")?.length
    ) {
      const retryAfterSeconds = parseInt(
        error.response.headers.get("retry-after")!,
        10,
      );
      return retryAfterSeconds * 1000;
    }
    return defaultRetryAfter;
  });
  return limiter;
}

export class FrontCoreClient {
  standardRateLimiter: Bottleneck;
  burstRateLimiter: Bottleneck;
  constructor(
    private apiKey: string,
    private host: string = DEFAULT_API_HOST,

    private standardRateLimit: StandardRateLimits = StandardRateLimits.STARTER,
  ) {
    this.standardRateLimiter = createRetryRateLimiter(this.standardRateLimit);
    // 5 requests per second per conversation, https://dev.frontapp.com/docs/rate-limiting#additional-burst-rate-limiting
    this.burstRateLimiter = createRetryRateLimiter(200);
  }

  private standardFetch = async <T = unknown>(
    url: string | URL,
    init?: RequestInit,
  ) => {
    return await this.standardRateLimiter.schedule(() =>
      jsonFetch<T>(url, init),
    );
  };

  private burstFetch = async <T = unknown>(
    url: string | URL,
    init?: RequestInit,
  ) => {
    return await this.burstRateLimiter.schedule(() => jsonFetch<T>(url, init));
  };

  private async fetchPagedResource<T extends Front.PagedResource>(
    resource: string,
    params?: Front.PagedEndpointParams,
  ) {
    const { next, limit = 10 } = params ?? {};
    let url: string | URL = new URL(resource, this.host);
    if (next) {
      url = next;
    } else {
      const queryParams = new URLSearchParams();
      // max front limit is 100
      // min is 10 anything less will be ignored
      if (10 < limit && limit <= 100) {
        queryParams.append("limit", limit.toString());
      }

      url.search = queryParams.toString();
    }
    return await this.standardFetch<Front.List<T>>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  public channels = async (params?: Front.PagedEndpointParams) => {
    return await this.fetchPagedResource<Front.Channel>("/channels", params);
  };

  public inboxes = async (params?: Front.PagedEndpointParams) => {
    return await this.fetchPagedResource<Front.Inbox>("/inboxes", params);
  };

  public shifts = async (params?: Front.PagedEndpointParams) => {
    return await this.fetchPagedResource<Front.Shift>("/shifts", params);
  };
  public shiftsTeammates = async (
    shiftId: string,
    params?: Front.PagedEndpointParams,
  ) => {
    return await this.fetchPagedResource<Front.Teammate>(
      `/shifts/${shiftId}/teammates`,
      params,
    );
  };

  public async importMessage(inboxId: string, message: Front.ImportedMessage) {
    const url = new URL(`/inboxes/${inboxId}/imported_messages`, this.host);

    return await this.burstFetch<Front.ImportMessageResponse>(url, {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}

export class FrontApplicationClient {
  private tokenDuration: number = 30; // seconds
  private token?: string;
  private tokenTimeout?: NodeJS.Timeout;
  burstRateLimiter: Bottleneck;
  constructor(
    private appId: string,
    private appSecret: string,
    private channelId: string,
    private host: string = DEFAULT_API_HOST,
  ) {
    // 5 requests per second per conversation, https://dev.frontapp.com/docs/rate-limiting#additional-burst-rate-limiting
    this.burstRateLimiter = createRetryRateLimiter(200);
  }

  private burstFetch = async <T = unknown>(
    url: string | URL,
    init?: RequestInit,
  ) => {
    return await this.burstRateLimiter.schedule(async () =>
      jsonFetch<T>(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
      }),
    );
  };

  private async getAuthToken() {
    if (this.token) return this.token;

    if (this.tokenTimeout) clearTimeout(this.tokenTimeout);
    this.token = await buildToken(
      this.appId,
      this.appSecret,
      this.channelId,
      this.tokenDuration,
    );
    this.tokenTimeout = setTimeout(
      () => {
        this.token = undefined;
      },
      (this.tokenDuration - 5) * 1000, // remove 5 seconds before the token expires to avoid using a stale token
    );
    return this.token;
  }

  public async sendIncomingMessages(msg: Front.AppChannelInboundMessage) {
    const url = new URL(
      `/channels/${this.channelId}/inbound_messages`,
      this.host,
    );
    return await this.burstFetch<Front.AppChannelSyncResponse>(url, {
      method: "POST",
      body: JSON.stringify(msg),
    });
  }

  public async sendOutgoingMessages(msg: Front.AppChannelOutboundMessage) {
    const url = new URL(
      `/channels/${this.channelId}/outbound_messages`,
      this.host,
    );
    return await this.burstFetch<Front.AppChannelSyncResponse>(url, {
      method: "POST",
      body: JSON.stringify(msg),
    });
  }
}

function randomString(length: number): string {
  return randomBytes(Math.floor(length / 2)).toString("hex");
}

async function buildToken(
  frontId: string,
  frontSecret: string,
  channelId: string,
  durationSeconds: number,
) {
  const encoder = new TextEncoder();
  return await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(frontId)
    .setSubject(channelId)
    .setExpirationTime(`${durationSeconds} seconds`)
    .setJti(randomString(8))
    .sign(encoder.encode(frontSecret));
}
