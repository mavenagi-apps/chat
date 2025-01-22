import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRedisPublishClient } from "@/app/api/server/lib/redis";
import type { Front } from "@/types/front";
import { nanoid } from "nanoid";
import { getAppSettings } from "@/app/api/server/utils";
import { createHmac } from "node:crypto";

const KNOWN_MESSAGE_TYPES = [
  "message",
  "message_autoreply",
  "message_imported",
];

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; agentId: string }> },
) => {
  const body = (await request.json()) as Front.WebhookPayload;

  // ignore unknown message types
  if (!KNOWN_MESSAGE_TYPES.includes(body.type)) {
    return NextResponse.json(
      { type: "bad_request", message: "Unknown message type sent to channel" },
      { status: 400 },
    );
  }

  // ignore imported messages... app is already aware of them
  if (body.type === "message_imported") {
    return NextResponse.json({
      type: "success",
    });
  }

  // ignore messages without conversation id... there is no conversation to send the message to
  const conversationId = body.metadata.external_conversation_ids.at(0);
  if (!conversationId) {
    return NextResponse.json(
      { type: "bad_request", message: "Missing conversation id" },
      { status: 400 },
    );
  }

  const { organizationId: orgId, agentId: agentId } = await params;
  // ignore messages with a bad agent configuration
  const agentAppSettings = await getAppSettings(orgId, agentId);
  if (agentAppSettings?.handoffConfiguration?.type !== "front") {
    return NextResponse.json(
      { type: "bad_request", message: "Unsupported agent" },
      { status: 400 },
    );
  }

  // ignore messages without a valid signature or too old
  const { apiSecret: frontAppSecret } = agentAppSettings.handoffConfiguration;
  const headers = request.headers;
  const frontRequestSignature = headers.get("x-front-signature");
  const frontRequestTimestamp = parseInt(
    headers.get("x-front-request-timestamp") ?? "0",
    10,
  );
  if (
    !isValidFrontRequest({
      timestamp: frontRequestTimestamp,
      body,
      frontSecret: frontAppSecret,
      signature: frontRequestSignature,
    })
  ) {
    return NextResponse.json(
      { type: "bad_request", message: "Invalid request" },
      { status: 400 },
    );
  }

  // TODO: handle auto-replies

  // publish the message to the correct channel
  const redisClient = await getRedisPublishClient();
  await redisClient.publish(
    `front:${orgId}:${agentId}:${conversationId}:message`,
    JSON.stringify(body.payload),
  );

  return NextResponse.json(
    {
      type: "success",
      external_id: nanoid(),
      external_conversation_id: conversationId,
    },
    { status: 200 },
  );
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; agentId: string }> },
) => {
  const body = await request.json();
  const { organizationId: orgId, agentId: agentId } = await params;
  const agentAppSettings = await getAppSettings(orgId, agentId);
  if (agentAppSettings?.handoffConfiguration?.type !== "front") {
    return NextResponse.json(
      { type: "bad_request", message: "Unsupported agent" },
      { status: 400 },
    );
  }

  // ignore messages without a valid signature or too old
  const { apiSecret: frontAppSecret } = agentAppSettings.handoffConfiguration;
  const headers = request.headers;
  const frontRequestSignature = headers.get("x-front-signature");
  const frontRequestTimestamp = parseInt(
    headers.get("x-front-request-timestamp") ?? "0",
    10,
  );
  if (
    !isValidFrontRequest({
      timestamp: frontRequestTimestamp,
      body,
      frontSecret: frontAppSecret,
      signature: frontRequestSignature,
    })
  ) {
    return NextResponse.json(
      { type: "bad_request", message: "Invalid request" },
      { status: 400 },
    );
  }

  // TODO: track this event in amplitude?
  if (process.env.ENABLE_API_LOGGING) {
    console.log(`Received ${request.method} ${request.url} request`, {
      orgId,
      agentId,
    });
  }

  return NextResponse.json(
    {
      type: "success",
    },
    { status: 200 },
  );
};

function isValidFrontRequest({
  timestamp,
  body,
  frontSecret,
  signature,
}: {
  timestamp: number;
  body: Front.WebhookPayload;
  frontSecret: string;
  signature: string | null;
}) {
  const elapsed = Date.now() - timestamp;
  if (elapsed > 5 * 60 * 60 * 1000) {
    // over 5 minutes have passed since the message was sent... reject it based on Front's recommendation
    return false;
  }
  const rawBody = JSON.stringify(body);
  const baseString = `${timestamp}:${rawBody}`;

  const hmac = createHmac("sha256", frontSecret)
    .update(baseString)
    .digest("base64");

  return hmac === signature;
}
