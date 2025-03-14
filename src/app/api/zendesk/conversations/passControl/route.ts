import { type NextRequest, NextResponse } from "next/server";
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/src/app/api/zendesk/utils";
import { withSettingsAndAuthentication } from "@/src/app/api/server/utils";

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (
      _request,
      settings,
      _organizationId,
      _agentId,
      userId,
      conversationId,
    ) => {
      if (settings.misc.handoffConfiguration?.type !== "zendesk") {
        return NextResponse.json(
          { error: "Zendesk Handoff configuration not found" },
          { status: 400 },
        );
      }

      const [SunshineConversationsClient, zendeskConversationsAppId] =
        await getSunshineConversationsClient(
          settings.misc.handoffConfiguration,
        );
      await postMessagesToZendeskConversation(
        SunshineConversationsClient,
        conversationId,
        userId,
        zendeskConversationsAppId,
        [
          {
            content: {
              type: "text",
              text: "User has ended the live agent chat.",
            },
            author: {
              type: "business",
              userId,
            },
          },
        ],
      );

      return NextResponse.json({ success: true });
    },
  );
}
