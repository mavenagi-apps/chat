import { type NextRequest, NextResponse } from "next/server";
import {
  decryptAndVerifySignedUserData,
  withSettingsAndAuthentication,
} from "@/app/api/server/utils";
import {
  createApplicationChannelClient,
  postMavenMessagesToFront,
} from "../../utils";
import type { VerifiedUserData } from "@/types";

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (
      _request,
      settings,
      _organizationId,
      _agentId,
      _userId,
      conversationId,
    ) => {
      const { signedUserData } = (await request.json()) as {
        signedUserData: string;
      };
      if (settings.handoffConfiguration?.type !== "front") {
        return NextResponse.json(
          { error: "Front Handoff configuration not found or invalid" },
          { status: 400 },
        );
      }

      const verifiedUserInfo = (await decryptAndVerifySignedUserData(
        signedUserData,
        settings,
      )) as VerifiedUserData;

      const { handoffConfiguration } = settings;

      const frontClient =
        await createApplicationChannelClient(handoffConfiguration);

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
