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
  createCoreClient,
  postMavenMessagesToFront,
} from "../utils";
import type { VerifiedUserData } from "@/types";
import { nanoid } from "nanoid";
import type { FrontCoreClient } from "../client";
import type { Front } from "@/types/front";

async function updateFrontUser(
  frontClient: FrontCoreClient,
  id: Front.Handle,
  data: { custom_fields: Record<string, unknown> },
): Promise<void> {
  const handleId = ["alt", id.source, id.handle].join(":");
  try {
    // lookup user (load custom attributes), upsert user and pass ALL custom attributes
    const user = await frontClient.contactById(handleId);
    await frontClient.contactUpdateById(handleId, {
      custom_fields: { ...user.custom_fields, ...data.custom_fields },
    });
  } catch (error) {
    console.error("Error updating front user", error);
  }
}

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
    const frontCoreClient = createCoreClient(handoffConfiguration);
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

    // creating messages in front will automatically create the user in front, now update with custom data
    // don't await, we don't need to wait for this to complete
    void updateFrontUser(
      frontCoreClient,
      { handle: verifiedUserInfo.email, source: "custom" },
      {
        // NOTE: standardize on to picking up custom data in userInfo from `custom_fields` to match front's naming
        //       but also support `customData` for backwards Scratchpay
        custom_fields:
          verifiedUserInfo?.custom_fields ?? verifiedUserInfo?.customData,
      },
    );

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
