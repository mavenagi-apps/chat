import { type NextRequest, NextResponse } from "next/server";
import { withSettingsAndAuthentication } from "@/src/app/api/server/utils";
import {
  generateSessionInitRequestHeaders,
  validateSalesforceConfig,
  validateAuthHeaders,
} from "@/src/app/api/salesforce/utils";

export async function POST(req: NextRequest) {
  return withSettingsAndAuthentication(
    req,
    async (
      _req,
      settings,
      _orgId,
      _agentId,
      _userId,
      _conversationId,
      authPayload,
    ) => {
      const { handoffConfiguration } = settings.misc;
      const validationError = validateSalesforceConfig(handoffConfiguration);
      if (validationError) return validationError;

      const { affinityToken, sessionKey } = authPayload;
      const { chatHostUrl: url } =
        handoffConfiguration as SalesforceHandoffConfiguration;

      const authError = validateAuthHeaders(affinityToken, sessionKey);
      if (authError) return authError;

      try {
        const chatSessionEndResponse = await fetch(
          url + `/chat/rest/System/SessionId/${sessionKey || ""}`,
          {
            method: "DELETE",
            headers: generateSessionInitRequestHeaders(
              sessionKey as string,
              affinityToken as string,
            ),
          },
        );

        if (!chatSessionEndResponse.ok) {
          throw new Error("Failed to end chat session");
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("endChatSession failed:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
  );
}
