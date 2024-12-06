import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import {
  FrontAppChannelInboundMessage,
  FrontAppChannelOutboundMessage,
} from "@/types/front";

export const DEFAULT_HOST = "https://api2.frontapp.com";

function randomString(length: number): string {
  return randomBytes(Math.floor(length / 2)).toString("hex");
}

async function buildToken(
  frontId: string,
  frontSecret: string,
  channelId: string,
) {
  const encoder = new TextEncoder();
  return await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(frontId)
    .setSubject(channelId)
    .setExpirationTime("30 seconds")
    .setJti(randomString(8))
    .sign(encoder.encode(frontSecret));
}

export async function postOutgoingMessages({
  host,
  frontId,
  frontSecret,
  channelId,
  payload,
}: {
  host: string;
  frontId: string;
  frontSecret: string;
  channelId: string;
  payload: FrontAppChannelOutboundMessage;
}) {
  const api_token = await buildToken(frontId, frontSecret, channelId);
  const url = new URL(`/channels/${channelId}/outbound_messages`, host);
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_token}`,
    },
    body: JSON.stringify(payload),
  });
}
export async function postIncomingMessages({
  host,
  frontId,
  frontSecret,
  channelId,
  payload,
}: {
  host: string;
  frontId: string;
  frontSecret: string;
  channelId: string;
  payload: FrontAppChannelInboundMessage;
}) {
  const api_token = await buildToken(frontId, frontSecret, channelId);
  const url = new URL(`/channels/${channelId}/inbound_messages`, host);
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_token}`,
    },
    body: JSON.stringify(payload),
  });
}
