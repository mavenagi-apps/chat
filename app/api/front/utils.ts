import { randomBytes } from "node:crypto";
import * as jwt from "jsonwebtoken";

function randomString(length: number): string {
  return randomBytes(Math.floor(length / 2)).toString("hex");
}

function buildToken(frontId: string, frontSecret: string, channelId: string) {
  const exp = Math.floor((Date.now() + 30000) / 1000);
  const payload = {
    iss: frontId,
    jti: randomString(8),
    sub: channelId,
    exp,
  };

  return jwt.sign(payload, frontSecret);
}

export type FrontAppChannelBaseMessage = {
  body: string;
  metadata: FrontMetadata;
  subject: string;
  delivered_at: number;
  attachments: string[];
};

export type FrontAppChannelInboundMessage = FrontAppChannelBaseMessage & {
  sender: FrontSender;
};

export type FrontAppChannelOutboundMessage = FrontAppChannelBaseMessage & {
  to: FrontSender[];
  sender_name: string;
};

export interface FrontMetadata {
  external_id: string;
  external_conversation_id: string;
}

export interface FrontSender {
  handle: string;
  name: string;
}

export const DEFAULT_HOST = "https://api2.frontapp.com";

export function postOutgoingMessages({
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
  const api_token = buildToken(frontId, frontSecret, channelId);
  return fetch(new URL(`/channels/${channelId}/outbound_messages`, host), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_token}`,
    },
    body: JSON.stringify(payload),
  });
}
export function postIncomingMessages({
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
  const api_token = buildToken(frontId, frontSecret, channelId);
  return fetch(new URL(`/channels/${channelId}/inbound_messages`, host), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_token}`,
    },
    body: JSON.stringify(payload),
  });
}
