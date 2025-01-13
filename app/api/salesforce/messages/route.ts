import { type NextRequest, NextResponse } from "next/server";

import { type ChatMessageResponse } from "@/types/salesforce";

import {
  SALESFORCE_ALLOWED_MESSAGE_TYPES,
  SALESFORCE_API_BASE_HEADERS,
  sendChatMessage,
} from "@/app/api/salesforce/utils";
import { withSettingsAndAuthentication } from "../../server/utils";

const SALESFORCE_CHAT_PROMPT_MESSAGE_NAMES = [
  "Management Center",
  "Management Center with Maven",
];
const SALESFORCE_CHAT_PROMPT_MESSAGE_TEXTS = ["Please enter the subject"];

export async function GET(req: NextRequest) {
  return withSettingsAndAuthentication(
    req,
    async (
      req,
      settings,
      _orgId,
      _agentId,
      _userId,
      _conversationId,
      authPayload,
    ) => {
      const { handoffConfiguration } = settings;
      if (handoffConfiguration?.type !== "salesforce") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid handoff configuration type. Expected 'salesforce'.",
          },
          { status: 400 },
        );
      }
      const { searchParams } = req.nextUrl;
      const [ack, subject] = [
        searchParams.get("ack") || (-1 as number),
        searchParams.get("subject") || ("I need assistance" as string),
      ];

      const { affinityToken, sessionKey } = authPayload;

      if (!affinityToken || !sessionKey) {
        return Response.json("Missing auth headers", {
          status: 401,
        });
      }

      const { chatHostUrl: url } = handoffConfiguration;

      try {
        const response = await fetch(
          `${url}/chat/rest/System/Messages?ack=${ack}`,
          {
            method: "GET",
            headers: {
              ...SALESFORCE_API_BASE_HEADERS,
              "X-LIVEAGENT-AFFINITY": affinityToken,
              "X-LIVEAGENT-SESSION-KEY": sessionKey,
            },
          },
        );

        console.log("GET chat messages response:", response.status);

        if (response.status === 204) {
          // No new messages, return an empty response with the same ack value
          return Response.json({
            messages: [],
            sequence: ack,
            offset: 0,
          });
        }

        if (!response.ok) {
          // throw new Error('Failed to get chat messages');
          return Response.json("Failed to get chat messages", {
            status: response.status,
          });
        }

        const result: ChatMessageResponse = await response.json();
        console.log("Chat messages retrieved:", result);

        const filteredMessages = result.messages.filter((message) => {
          if (message.type === "ChatMessage") {
            if (
              SALESFORCE_CHAT_PROMPT_MESSAGE_NAMES.includes(
                message.message.name || "",
              ) &&
              SALESFORCE_CHAT_PROMPT_MESSAGE_TEXTS.includes(
                message.message.text || "",
              )
            ) {
              // Send the subject
              void sendChatMessage(subject, affinityToken, sessionKey, url);
              return false;
            }
          }
          return SALESFORCE_ALLOWED_MESSAGE_TYPES.includes(message.type);
        });

        return Response.json({ ...result, messages: filteredMessages });
      } catch (error) {
        console.log("getChatMessages failed:", error);
        throw error;
      }
    },
  );
}

export async function POST(req: NextRequest) {
  return withSettingsAndAuthentication(
    req,
    async (
      req,
      settings,
      _orgId,
      _agentId,
      _userId,
      _conversationId,
      authPayload,
    ) => {
      const { handoffConfiguration } = settings;
      if (handoffConfiguration?.type !== "salesforce") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid handoff configuration type. Expected 'salesforce'.",
          },
          { status: 400 },
        );
      }

      const { text } = await req.json();
      const { chatHostUrl: url } = handoffConfiguration;
      const { affinityToken, sessionKey } = authPayload;

      if (!affinityToken || !sessionKey) {
        return Response.json("Missing auth headers", {
          status: 401,
        });
      }

      try {
        await sendChatMessage(text, affinityToken, sessionKey, url);
        return Response.json("Chat message sent");
      } catch (error) {
        console.log("Failed to send chat message:", error);
        return Response.json("Failed to send chat message", { status: 500 });
      }
    },
  );
}

export const maxDuration = 300;
