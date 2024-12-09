import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import type { Front } from "@/types/front";

export const DEFAULT_API_HOST = "https://api2.frontapp.com";
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

    this.token = await buildToken(
      this.appId,
      this.appSecret,
      this.channelId,
      this.tokenDuration * 1000,
    );
    if (this.tokenTimeout) clearTimeout(this.tokenTimeout);
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
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
