import type { Message, ChatMessage, ZendeskWebhookMessage } from "@/types";
import type { Front } from "@/types/front";
import {
  type ConversationMessageResponse,
  BotConversationMessageType,
  EntityType,
} from "mavenagi/api";

export const createUserMessage = (text: string): Message => ({
  type: "USER",
  text,
  timestamp: 123456789,
});

export const createBotMessage = (
  responses: { text: string }[],
): ConversationMessageResponse.Bot => ({
  type: "bot",
  botMessageType: BotConversationMessageType.BotResponse,
  conversationMessageId: {
    appId: "app-123",
    organizationId: "org-123",
    agentId: "agent-123",
    referenceId: "msg-123",
    type: EntityType.ConversationMessage,
  },
  metadata: {
    followupQuestions: [],
    sources: [],
  },
  responses: responses.map((r) => ({ type: "text" as const, text: r.text })),
});

export const createZendeskEvent = (
  authorType: "business" | "user",
  displayName?: string,
): ZendeskWebhookMessage => ({
  id: "123",
  type: "conversation:message",
  payload: {
    type: "conversation:message",
    conversation: {
      id: "conv-123",
      type: "personal",
    },
    message: {
      id: "msg-123",
      author: {
        type: authorType,
        displayName,
      },
      content: { type: "text", text: "Hello" },
      received: "2023-01-01T00:00:00Z",
    },
  },
  createdAt: "2023-01-01T00:00:00Z",
});

export const createFrontEvent = (
  firstName: string,
  lastName: string,
): Front.WebhookMessage => ({
  type: "custom",
  created_at: 1672531200,
  author: {
    _links: {
      self: "https://api.front.com/v1/users/author-123",
      related: {
        channels: undefined,
        comments: undefined,
        conversation: undefined,
        conversations: undefined,
        contact: undefined,
        events: undefined,
        inboxes: undefined,
        messages: undefined,
        teammates: undefined,
      },
    },
    id: "author-123",
    email: "agent@example.com",
    username: "agent",
    first_name: firstName,
    last_name: lastName,
    is_admin: false,
    is_available: true,
    is_blocked: false,
  },
  is_inbound: false,
  blurb: "",
  body: "",
  text: "",
  error_type: null,
  version: "",
  subject: "",
  draft_mode: "",
  metadata: {
    headers: {
      in_reply_to: null,
    },
  },
  recipients: [],
  attachments: [],
  signature: null,
  is_draft: false,
  _links: {
    self: "https://api.front.com/v1/users/author-123",
    related: {
      channels: undefined,
      comments: undefined,
      conversation: undefined,
      conversations: undefined,
      contact: undefined,
      events: undefined,
      inboxes: undefined,
      messages: undefined,
      teammates: undefined,
    },
  },
  id: "msg-123",
});

export const createSalesforceEvent = (
  type: string,
  message: Record<string, any>,
) => ({
  type,
  message,
  timestamp: 1672531200000, // 2023-01-01
});
