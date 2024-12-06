import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { waitUntil } from "@vercel/functions";
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/app/api/zendesk/utils";
import { withSettingsAndAuthentication } from "@/app/api/server/utils";
import { getRedisClient } from "@/app/api/server/lib/redis";

const KEEP_ALIVE_INTERVAL = 30000;
const SIGNING_SECRET_ALGORITHM = "sha256";

const verifyWebhookMessage = (
  payload: ZendeskMessagePayload,
  webhookSecret: string,
) => {
  const { webhookId, signature, timestamp, rawBody } = payload;
  if (!webhookId || !signature || !timestamp || !rawBody) {
    return false;
  }

  const hmac = crypto.createHmac(SIGNING_SECRET_ALGORITHM, webhookSecret);
  const sig = hmac.update(timestamp + rawBody).digest("base64");

  return sig === signature;
};

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (req, settings, _orgId, _agentId, userId, conversationId) => {
      const { message } = await req.json();

      if (!settings.handoffConfiguration) {
        throw new Error("Handoff configuration not found");
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
      const { webhookId, webhookSecret } = handoffConfiguration || {};
      if (!webhookId || !webhookSecret) {
        return NextResponse.json("Error: Webhook configuration not found", {
          status: 400,
        });
      }

      const pattern = `zendesk:${conversationId}:${webhookId}:*`;
      const redisClient = await getRedisClient();

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
                  if (!verifyWebhookMessage(parsedMessage, webhookSecret)) {
                    return;
                  }

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
