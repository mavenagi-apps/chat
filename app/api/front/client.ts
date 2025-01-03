import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import type { Front } from "@/types/front";
import { jsonFetch } from "@/lib/jsonFetch";

export const DEFAULT_API_HOST = "https://api2.frontapp.com";

export class FrontCoreClient {
  constructor(
    private apiKey: string,
    private host: string = DEFAULT_API_HOST,
  ) {}

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
    return await jsonFetch<Front.List<T>>(url, {
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

  public async importMessage(inboxId: string, message: Front.ImportedMessage) {
    const url = new URL(`/inboxes/${inboxId}/imported_messages`, this.host);

    return await jsonFetch<Front.ImportMessageResponse>(url, {
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
  constructor(
    private appId: string,
    private appSecret: string,
    private channelId: string,
    private host: string = DEFAULT_API_HOST,
  ) {}

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
    const token = await this.getAuthToken();
    const url = new URL(
      `/channels/${this.channelId}/inbound_messages`,
      this.host,
    );
    return await jsonFetch<Front.AppChannelSyncResponse>(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(msg),
    });
  }

  public async sendOutgoingMessages(msg: Front.AppChannelOutboundMessage) {
    const token = await this.getAuthToken();
    const url = new URL(
      `/channels/${this.channelId}/outbound_messages`,
      this.host,
    );
    return await jsonFetch<Front.AppChannelSyncResponse>(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
