import jwt from "jsonwebtoken";
import {
  decryptAndVerifySignedUserData,
  withAppSettings,
} from "@/app/api/server/utils";
import { type NextRequest, NextResponse } from "next/server";
import type { HandoffChatMessage } from "@/types";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";
import type { FrontApplicationClient } from "../client";
import {
  convertToFrontMessage,
  createApplicationChannelClient,
  sendMessageToFront,
} from "../utils";
import type { VerifiedUserData } from "@/types";
import { nanoid } from "nanoid";
import { JsonFetchError } from "@/lib/jsonFetch";
import Bottleneck from "bottleneck";

export async function POST(req: NextRequest) {
  return withAppSettings(req, async (request, settings, _orgId, _agentId) => {
    const { messages, signedUserData } = (await request.json()) as {
      messages: HandoffChatMessage[];
      signedUserData: string;
    };
    const { handoffConfiguration } = settings;

    if (!handoffConfiguration) {
      throw new Error("Handoff configuration not found");
    }

    const { apiSecret, appId, apiKey, type } = handoffConfiguration;

    if (!appId || !apiSecret || !apiKey || type !== "front") {
      throw new Error("Invalid handoff configuration");
    }

    const frontClient =
      await createApplicationChannelClient(handoffConfiguration);
    const verifiedUserInfo = (await decryptAndVerifySignedUserData(
      signedUserData,
      settings,
    )) as VerifiedUserData;

    const conversationId =
      messages.find((x) => x.mavenContext?.conversationId)?.mavenContext
        ?.conversationId ?? nanoid();
    await postMavenMessagesToFront({
      conversationId,
      client: frontClient,
      messages,
      userInfo: verifiedUserInfo,
    });

    const token = jwt.sign(
      { scope: "appUser", userId: verifiedUserInfo.email, conversationId },
      apiSecret,
      {
        keyid: appId, // apiKey,
      },
    );

    return NextResponse.json(
      { success: true },
      {
        headers: {
          [HANDOFF_AUTH_HEADER]: token,
        },
      },
    );
  });
}

async function postMavenMessagesToFront({
  conversationId,
  client,
  messages,
  userInfo,
}: {
  conversationId: string;
  client: FrontApplicationClient;
  messages: HandoffChatMessage[];
  userInfo: VerifiedUserData;
}) {
  const frontMessages = messages
    .map((message: any) =>
      convertToFrontMessage(conversationId, userInfo, message),
    )
    .filter((message) => !!message);

  if (!frontMessages.length) {
    return;
  }

  const frontLimiter = new Bottleneck({
    minTime: 200, // 5 requests per second per conversation
  });
  frontLimiter.on("failed", async (error, info) => {
    enum RetryableStatusCodes {
      TooManyRequests = 429,
      InternalServerError = 500,
      NotImplemented = 501,
      BadGateway = 502,
      ServiceUnavailable = 503,
      GatewayTimeout = 504,
    }
    const { retryCount } = info;
    const backoffs = [0.2, 0.4, 0.8, 1, 2];
    if (
      error instanceof JsonFetchError &&
      Object.values(RetryableStatusCodes).includes(error.response.status)
    ) {
      const retryAfterSeconds = parseInt(
        error.response.headers.get("retry-after") ??
          String(backoffs[retryCount]),
        10,
      );
      return retryAfterSeconds * 1000;
    }
    return;
  });

  for (const message of frontMessages) {
    try {
      await frontLimiter.schedule(() => sendMessageToFront(client, message));
    } catch (error) {
      console.error(`Failed to deliver message to Front`, error);
      throw new Error("Failed to deliver message");
    }
  }
}
