import { type NextRequest, NextResponse } from "next/server";
import { withAppSettings } from "@/app/api/server/utils";

export async function POST(request: NextRequest) {
  return withAppSettings(
    request,
    async (_request, settings, _organizationId, _agentId) => {
      // NOTE: request to this endpoint use keepalive: true and must remain under 1024 kibibytes
      // https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#keepalive
      if (settings.handoffConfiguration?.type !== "zendesk") {
        return NextResponse.json(
          { error: "Front Handoff configuration not found or invalid" },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true });
    },
  );
}
