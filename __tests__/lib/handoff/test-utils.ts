import type { Message } from "@/src/types";
import type {
  SalesforceChatMessage,
  SalesforceMessageType,
} from "@/src/types/salesforce";
import { MavenAGI } from "mavenagi";
import { Front } from "@/src/types/front";
import type { ZendeskWebhookMessage } from "@/src/types/zendesk";
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
    conversationMessageId: {
      referenceId: "msg-123",
      type: MavenAGI.EntityType.ConversationMessage,
      appId: "app-123",
      organizationId: "org-123",
      agentId: "agent-123",
    },
    metadata: {
      followupQuestions: [],
      sources: [],
    },
  };
}

export function createSalesforceEvent(
  type: SalesforceMessageType,
  agentName?: string,
  messageText: string = "Hello",
): SalesforceChatMessage {
  return {
    type,
    message: {
      text: messageText,
      name: agentName || "Unknown Agent",
      schedule: {
        responseDelayMilliseconds: 0,
      },
      agentId: "agent-123",
    },
  };
}

export function createFrontEvent(
  firstName: string,
  lastName: string,
): Front.WebhookMessage {
  return {
    type: "message",
    id: "msg-123",
    is_inbound: true,
    created_at: 123456789,
    blurb: "Hello",
    body: "Hello",
    text: "Hello",
    error_type: null,
    version: "1.0.0",
    subject: "Hello",
    _links: {
      self: "https://example.com",
      related: {
        channels: "https://example.com",
        comments: "https://example.com",
        conversation: "https://example.com",
        conversations: "https://example.com",
        contact: "https://example.com",
        events: "https://example.com",
      },
    },
    draft_mode: "false",
    metadata: {
      headers: {
        in_reply_to: null,
      },
    },
    author: {
      id: "123",
      email: "john.doe@example.com",
      username: "john.doe",
      first_name: firstName,
      last_name: lastName,
      is_admin: false,
      is_available: true,
      is_blocked: false,
      _links: {
        self: "https://example.com",
        related: {
          conversations: "https://example.com",
        },
      },
    },
    recipients: [],
    attachments: [],
    signature: null,
    is_draft: false,
  };
}

export function createZendeskEvent(
  type: "user" | "business",
  agentName: string,
): ZendeskWebhookMessage {
  return {
    type: "message",
    id: "msg-123",
    createdAt: "2021-01-01T00:00:00Z",
    payload: {
      type: "conversation:message",
      message: {
        id: "msg-123",
        author: {
          type,
          avatarUrl: "https://example.com/avatar.png",
          displayName: agentName,
        },
        content: {
          type: "text",
          text: "Hello",
        },
        received: "2021-01-01T00:00:00Z",
      },
    },
  };
}
