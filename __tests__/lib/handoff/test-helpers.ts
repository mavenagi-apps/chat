import type { Message, Bot, ZendeskWebhookMessage } from "@/types";
import type { Front } from "@/types/front";

export const createUserMessage = (text: string): Message => ({
  type: "USER",
  text,
  timestamp: 123456789,
  conversationMessageId: {
    type: "maven",
    appId: "app-123",
    organizationId: "org-123",
    agentId: "agent-123",
    referenceId: "msg-123",
  },
});

export const createBotMessage = (
  responses: { text: string }[],
): Bot & { timestamp?: number } => ({
  type: "bot",
  botMessageType: "chat",
  conversationMessageId: {
    type: "maven",
    appId: "app-123",
    organizationId: "org-123",
    agentId: "agent-123",
    referenceId: "msg-123",
  },
  metadata: {
    followupQuestions: [],
    sources: [],
  },
  responses: responses.map((r) => ({ type: "text" as const, text: r.text })),
  timestamp: 123456789,
});

export const createZendeskEvent = (
  authorType: "business" | "user",
  displayName?: string,
): ZendeskWebhookMessage => ({
  id: "123",
  type: "conversation:message",
  payload: {
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
  payload: {},
  created_at: 1672531200,
  author: {
    _links: {
      self: { href: "http://example.com" },
      related: { href: "http://example.com" },
    },
    id: "author-123",
    email: "agent@example.com",
    username: "agent",
    first_name: firstName,
    last_name: lastName,
    is_admin: false,
    is_available: true,
  },
});
