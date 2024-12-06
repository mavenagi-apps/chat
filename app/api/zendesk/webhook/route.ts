import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRedisClient } from "@/app/api/server/lib/redis";

const ZENDESK_CONVERSATION_EVENT_TYPE_PREFIX = "conversation:";

export const POST = async (request: NextRequest) => {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);
  const webhookId = request.headers.get("x-zendesk-webhook-id");
  const signature = request.headers.get("x-zendesk-webhook-signature");
  const timestamp = request.headers.get(
    "x-zendesk-webhook-signature-timestamp",
  );

  if (!webhookId || !signature || !timestamp) {
    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }

  for (const event of body.events || []) {
    if (!event.type.startsWith(ZENDESK_CONVERSATION_EVENT_TYPE_PREFIX)) {
      continue;
    }

    const conversationId = event.payload?.conversation?.id;
    const eventId = event.id;

    if (!conversationId || !eventId) {
      continue;
    }

    const redisClient = await getRedisClient();

    await redisClient.publish(
      `zendesk:${conversationId}:${webhookId}:${eventId}`,
      JSON.stringify({
        webhookId,
        signature,
        timestamp,
        rawBody,
        event,
      } as ZendeskMessagePayload),
    );
  }

  return NextResponse.json({ success: true });
};
