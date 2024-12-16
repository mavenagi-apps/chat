import { type NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/app/api/zendesk/utils";
import { withSettingsAndAuthentication } from "@/app/api/server/utils";
import { getRedisSubscribeClient } from "@/app/api/server/lib/redis";
import type { ZendeskMessagePayload } from "@/types/zendesk";

const KEEP_ALIVE_INTERVAL = 30000;

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (req, settings, _orgId, _agentId, userId, conversationId) => {
      const { message } = await req.json();

      if (settings.handoffConfiguration?.type !== "zendesk") {
        throw new Error("Zendesk Handoff configuration not found");
      }

      const [SunshineConversationsClient, zendeskConversationsAppId] =
        await getSunshineConversationsClient(settings.handoffConfiguration);

      await postMessagesToZendeskConversation(
        SunshineConversationsClient,
        conversationId,
        userId,
        zendeskConversationsAppId,
        [
          {
            author: {
              type: "user",
            },
            content: {
              type: "text",
              text: message,
            },
          },
        ],
      );

      return NextResponse.json({ success: true });
    },
  );
}

export async function GET(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (
      _req,
      settings,
      _organizationId,
      _agentId,
      _userId,
      conversationId,
    ) => {
      const encoder = new TextEncoder();
      const { handoffConfiguration } = settings;
      const { webhookId } =
        (handoffConfiguration as ZendeskHandoffConfiguration) || {};
      if (!webhookId) {
        return NextResponse.json("Error: Webhook configuration not found", {
          status: 400,
        });
      }

      const pattern = `zendesk:${conversationId}:${webhookId}:*`;
      const redisClient = await getRedisSubscribeClient();

      let keepAliveInterval: NodeJS.Timeout;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            await redisClient.pSubscribe(
              pattern,
              (message: string, channel: string) => {
                try {
                  const parsedMessage: ZendeskMessagePayload =
                    JSON.parse(message);

                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ message: parsedMessage.event, channel })}\n\n`,
                    ),
                  );
                } catch (error) {
                  console.error(
                    "Error processing subscription message:",
                    error,
                  );
                }
              },
            );

            keepAliveInterval = setInterval(() => {
              controller.enqueue(encoder.encode(": keep-alive\n\n"));
            }, KEEP_ALIVE_INTERVAL);
          } catch (error) {
            console.error("Error streaming messages:", error);
            controller.error(error);
          }
        },
        cancel() {
          clearInterval(keepAliveInterval);
          redisClient.pUnsubscribe(pattern).catch(console.error);
        },
      });

      const response = new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      waitUntil(new Promise(() => {}));

      return response;
    },
  );
}

export const maxDuration = 900;
