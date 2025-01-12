import type { Message } from "@/types";
import type {
  SalesforceChatMessage,
  SalesforceMessageType,
} from "@/types/salesforce";
import { type ConversationMessageResponse } from "mavenagi/api";

export interface BotResponse {
  type: "text";
  text: string;
}

export function createUserMessage(text: string): Message {
  return {
    type: "USER",
    text,
    timestamp: 123456789,
  };
}

export function createBotMessage(responses: BotResponse[]): Message {
  return {
    type: "bot",
    responses,
    timestamp: 123456789,
    botMessageType: "BOT_RESPONSE",
    metadata: {
      followupQuestions: [],
      sources: [],
    },
  };
}

export function createSalesforceEvent(
  type: SalesforceMessageType,
  agentName?: string,
): SalesforceChatMessage {
  return {
    type,
    message: {
      text: "Hello",
      name: agentName || "Unknown Agent",
      schedule: {
        responseDelayMilliseconds: 0,
      },
      agentId: "agent-123",
    },
  };
}
