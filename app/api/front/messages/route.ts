import { type NextRequest, NextResponse } from "next/server";
import {
  decryptAndVerifySignedUserData,
  withSettingsAndAuthentication,
} from "@/app/api/server/utils";
import { getRedisSubscribeClient } from "@/app/api/server/lib/redis";
import {
  createApplicationChannelClient,
  postMavenMessagesToFront,
} from "../utils";
import type { VerifiedUserData } from "@/types";
import { waitUntil } from "@vercel/functions";

const KEEP_ALIVE_INTERVAL = 30000;

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (req, settings, orgId, agentId, _userId, conversationId) => {
      const { message, signedUserData } = (await req.json()) as {
        message: string;
        signedUserData: string;
      };

      if (settings.misc.handoffConfiguration?.type !== "front") {
        return NextResponse.json(
          { error: "Front Handoff configuration not found or invalid" },
          { status: 400 },
        );
      }

      const verifiedUserInfo = (await decryptAndVerifySignedUserData(
        signedUserData,
        settings,
      )) as VerifiedUserData;

      const { handoffConfiguration } = settings.misc;

      const frontClient = await createApplicationChannelClient(
        orgId,
        agentId,
        handoffConfiguration,
      );

      await postMavenMessagesToFront({
        conversationId,
        client: frontClient,
        messages: [
          {
            author: { type: "user" },
            content: { type: "text", text: message },
            timestamp: Date.now(),
            mavenContext: { conversationId },
          }!,
        ],
        userInfo: verifiedUserInfo,
      });

      return NextResponse.json({ success: true });
    },
  );
}

export async function GET(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (
      _req,
      _settings,
      organizationId,
      agentId,
      _userId,
      conversationId,
    ) => {
      const encoder = new TextEncoder();
      const pattern = `front:${organizationId}:${agentId}:${conversationId}:*`;
      const redisClient = await getRedisSubscribeClient();

      let keepAliveInterval: NodeJS.Timeout;
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await redisClient.pSubscribe(pattern, (message, channel) => {
              try {
                const parsedMessage = JSON.parse(message);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ message: parsedMessage, channel })}\n\n`,
                  ),
                );
              } catch (error) {
                console.error("Error processing subscription message:", error);
              }
            });

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
