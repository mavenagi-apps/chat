import { type NextRequest, NextResponse } from "next/server";
import {
  type SalesforceChatMessage,
  SALESFORCE_CHAT_SUBJECT_HEADER_KEY,
} from "@/types/salesforce";

import {
  SALESFORCE_ALLOWED_MESSAGE_TYPES,
  SALESFORCE_CHAT_PROMPT_MESSAGE_NAMES,
  SALESFORCE_CHAT_PROMPT_MESSAGE_TEXTS,
  sendChatMessage,
  validateSalesforceConfig,
  validateAuthHeaders,
  fetchChatMessages,
} from "@/app/api/salesforce/utils";
import { withSettingsAndAuthentication } from "../../server/utils";

function filterMessages(messages: SalesforceChatMessage[]) {
  return messages.filter((message) =>
    SALESFORCE_ALLOWED_MESSAGE_TYPES.includes(message.type),
  );
}

function isSubjectPromptMessage(message: SalesforceChatMessage) {
  return (
    SALESFORCE_CHAT_PROMPT_MESSAGE_NAMES.includes(message.message.name || "") &&
    SALESFORCE_CHAT_PROMPT_MESSAGE_TEXTS.includes(message.message.text || "")
  );
}

async function handleMessageStreaming(
  req: NextRequest,
  url: string,
  affinityToken: string,
  sessionKey: string,
) {
  const stream = new ReadableStream({
    async start(controller) {
      let ack = -1;
      try {
        while (!req.signal.aborted) {
          const { sequence, messages } = await fetchChatMessages(
            url,
            ack,
            affinityToken,
            sessionKey,
          );
          const filteredMessages = filterMessages(messages);
          ack = sequence;

          for (const message of filteredMessages) {
            if (isSubjectPromptMessage(message)) {
              void sendChatMessage(
                req.headers.get(SALESFORCE_CHAT_SUBJECT_HEADER_KEY) ||
                  "I need assistance",
                affinityToken,
                sessionKey,
                url,
              );
              continue;
            }

            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  message: message as SalesforceChatMessage,
                })}\n\n`,
              ),
            );
          }
        }
      } catch (error) {
        console.log("Failed to get chat messages:", error);
      } finally {
        controller.close();
      }
    },
    cancel() {
      console.log("Stream cancelled by client");
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

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
      const validationError = validateSalesforceConfig(handoffConfiguration);
      if (validationError) return validationError;

      const { affinityToken, sessionKey } = authPayload;
      const { chatHostUrl: url } =
        handoffConfiguration as SalesforceHandoffConfiguration;

      const authError = validateAuthHeaders(affinityToken, sessionKey);
      if (authError) return authError;

      return handleMessageStreaming(
        req,
        url,
        affinityToken as string,
        sessionKey as string,
      );
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
      const validationError = validateSalesforceConfig(handoffConfiguration);
      if (validationError) return validationError;

      const {
        message,
      }: {
        message: string;
        signedUserData: string | null;
        unsignedUserData: Record<string, any> | null;
      } = await req.json();
      const { chatHostUrl: url } =
        handoffConfiguration as SalesforceHandoffConfiguration;
      const { affinityToken, sessionKey } = authPayload;

      const authError = validateAuthHeaders(affinityToken, sessionKey);
      if (authError) return authError;

      try {
        await sendChatMessage(
          message,
          affinityToken as string,
          sessionKey as string,
          url as string,
        );
        return Response.json("Chat message sent");
      } catch (error) {
        console.log("Failed to send chat message:", error);
        return Response.json("Failed to send chat message", { status: 500 });
      }
    },
  );
}

export const maxDuration = 900;
