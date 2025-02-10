import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRedisPublishClient } from "@/app/api/server/lib/redis";
import type { ZendeskMessagePayload } from "@/types/zendesk";

const ZENDESK_CONVERSATION_EVENT_TYPE_PREFIX = "conversation:";
const BLOCKLIST_EVENTS = ["conversation:message:delivery:channel"];

export const POST = async (request: NextRequest) => {
  const ENABLE_API_LOGGING = process.env.ENABLE_API_LOGGING === "true";
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);
  const {
    webhook: { id: webhookId },
  } = body;

  if (ENABLE_API_LOGGING) {
    console.log(rawBody);
  }

  for (const event of body.events || []) {
    if (!event.type.startsWith(ZENDESK_CONVERSATION_EVENT_TYPE_PREFIX)) {
      continue;
    }

    if (BLOCKLIST_EVENTS.includes(event.type)) {
      continue;
    }

    const conversationId = event.payload?.conversation?.id;
    const eventId = event.id;

    if (!conversationId || !eventId) {
      continue;
    }

    const redisClient = await getRedisPublishClient();

    await redisClient.publish(
      `zendesk:${conversationId}:${webhookId}:${eventId}`,
      JSON.stringify({
        webhookId,
        event,
      } as ZendeskMessagePayload),
    );
  }

  return NextResponse.json({ success: true });
};
