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

  for (const message of frontMessages) {
    const response = await sendMessageToFront(client, message);
    // TODO: handle errors
    if (response) {
      console.log(
        "Posted message",
        response.ok,
        response.status,
        await response.text(),
      );
    }
  }
}
