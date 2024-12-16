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

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (req, settings, _orgId, _agentId, _userId, conversationId) => {
      const { message, signedUserData } = (await req.json()) as {
        message: string;
        signedUserData: string;
      };

      if (settings.handoffConfiguration?.type !== "front") {
        throw new Error("Zendesk Handoff configuration not found");
      }

      const verifiedUserInfo = (await decryptAndVerifySignedUserData(
        signedUserData,
        settings,
      )) as VerifiedUserData;

      const { handoffConfiguration } = settings;

      // TODO: remove this line
      handoffConfiguration.channelName = "channel-2-install-2";
      const frontClient =
        await createApplicationChannelClient(handoffConfiguration);

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
          } catch (error) {
            console.error("Error streaming messages:", error);
            controller.error(error);
          }
        },
        cancel() {
          redisClient.pUnsubscribe(pattern).catch(console.error);
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  );
}

export const maxDuration = 900;
