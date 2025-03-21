import { type NextRequest, NextResponse } from "next/server";
import {
  decryptAndVerifySignedUserData,
  withSettingsAndAuthentication,
} from "@/src/app/api/server/utils";
import {
  createApplicationChannelClient,
  postMavenMessagesToFront,
} from "../../utils";
import type { VerifiedUserData } from "@/src/types";

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (
      _request,
      settings,
      organizationId,
      agentId,
      _userId,
      conversationId,
    ) => {
      const { signedUserData } = (await request.json()) as {
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
        organizationId,
        agentId,
        handoffConfiguration,
      );

      await postMavenMessagesToFront({
        conversationId,
        client: frontClient,
        messages: [
          {
            author: { type: "user" },
            content: {
              type: "text",
              text: "User has ended the live agent chat.",
            },
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
