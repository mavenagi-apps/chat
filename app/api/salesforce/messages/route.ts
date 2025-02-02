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
  ChatMessagesError,
} from "@/app/api/salesforce/utils";
import { withSettingsAndAuthentication } from "../../server/utils";

const DEFAULT_KEEPALIVE_INTERVAL = 10000; // 10 seconds

function getKeepaliveInterval() {
  const interval = Number(
    process.env.SALESFORCE_MESSAGE_STREAM_KEEPALIVE_INTERVAL,
  );
  return isNaN(interval) ? DEFAULT_KEEPALIVE_INTERVAL : interval;
}

const KEEPALIVE_INTERVAL = getKeepaliveInterval();
const KEEPALIVE_MESSAGE = new TextEncoder().encode(
  "event: keepalive\ndata: {}\n\n",
);

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
      let keepaliveInterval: NodeJS.Timeout | undefined;

      const resetKeepalive = () => {
        if (keepaliveInterval) {
          clearInterval(keepaliveInterval);
        }
        keepaliveInterval = setInterval(() => {
          if (!req.signal.aborted) {
            controller.enqueue(KEEPALIVE_MESSAGE);
          }
        }, KEEPALIVE_INTERVAL);
      };

      try {
        // Initial keepalive setup
        resetKeepalive();

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
            resetKeepalive(); // Reset keepalive after sending a message
          }
        }
      } catch (error: any) {
        if (error instanceof ChatMessagesError && req.signal.aborted) {
          console.log("Expected error: conversation deleted during long poll");
        } else {
          console.error(
            "Failed to get chat messages:",
            error?.message,
            error?.stack,
          );
        }
      } finally {
        clearInterval(keepaliveInterval);
        controller.close();
      }
    },
    cancel() {
      console.log("Stream cancelled by client");
    },
  });

  return new Response(stream, {
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
        return NextResponse.json("Chat message sent");
      } catch (error: any) {
        console.error(
          "Failed to get chat messages:",
          error?.message,
          error?.stack,
        );
        return NextResponse.json("Failed to send chat message", {
          status: 500,
        });
      }
    },
  );
}

export const maxDuration = 900;
