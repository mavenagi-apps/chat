import jwt from "jsonwebtoken";
import {
  decryptAndVerifySignedUserData,
  withAppSettings,
} from "@/app/api/server/utils";
import { type NextRequest, NextResponse } from "next/server";
import type { HandoffChatMessage } from "@/types";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";
import {
  createApplicationChannelClient,
  postMavenMessagesToFront,
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

    if (
      handoffConfiguration?.type !== "front" ||
      !handoffConfiguration.appId ||
      !handoffConfiguration.apiSecret ||
      !handoffConfiguration.apiKey
    ) {
      return NextResponse.json(
        { error: "Front Handoff configuration not found or invalid" },
        { status: 400 },
      );
    }

    const { appId, apiSecret } = handoffConfiguration;
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
        keyid: appId,
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
