import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import { SALESFORCE_MESSAGE_TYPES } from "@/src/types/salesforce";
import type {
  UserChatMessage,
  SalesforceChatMessage,
  ZendeskWebhookMessage,
  IncomingHandoffConnectionEvent,
  QueueUpdateMessage,
  CombinedMessage,
} from "@/src/types";
import type { Front } from "@/src/types/front";
import type {
  ConversationMessageResponse,
  AskStreamActionEvent,
} from "mavenagi/api";
import { RouterProvider } from "@/__tests__/utils/test-utils";
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ChatMessage", () => {
  const defaultProps = {
    mavenUserId: "test-user-id",
    onBailoutFormSubmitSuccess: vi.fn(),
  };

  describe("User Messages", () => {
    it("renders user message correctly", () => {
      const message: UserChatMessage = {
        type: "USER",
        text: "Hello world",
        timestamp: 123456789,
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("renders user message with attachment", () => {
      const message: UserChatMessage = {
        type: "USER",
        text: "Message with image",
        timestamp: 123456789,
        attachments: [
          {
            type: "image/png",
            content: "base64content",
          },
        ],
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Message with image")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "data:image/png;base64,base64content",
      );
    });
  });

  describe("Bot Messages", () => {
    it("renders bot message correctly", () => {
      const message: ConversationMessageResponse.Bot = {
        type: "bot",
        botMessageType: "BOT_RESPONSE",
        responses: [{ type: "text", text: "Bot response" }],
        conversationMessageId: {
          referenceId: "msg-123",
          type: "CONVERSATION_MESSAGE",
          appId: "app-123",
          organizationId: "org-123",
          agentId: "agent-123",
        },
        metadata: {
          followupQuestions: [],
          sources: [],
        },
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Bot response")).toBeInTheDocument();
    });

    it("renders bailout form when message is action type", () => {
      const message: ConversationMessageResponse.Bot & {
        action: AskStreamActionEvent;
      } = {
        type: "bot",
        botMessageType: "BOT_RESPONSE",
        responses: [{ type: "text", text: "Bot response" }],
        conversationMessageId: {
          referenceId: "msg-123",
          type: "CONVERSATION_MESSAGE",
          appId: "app-123",
          organizationId: "org-123",
          agentId: "agent-123",
        },
        metadata: {
          followupQuestions: [],
          sources: [],
        },
        action: {
          id: "test-action",
          formLabel: "test-form",
          fields: [],
          submitLabel: "test-submit",
        },
      };

      render(
        <RouterProvider>
          <ChatMessage
            message={message}
            {...defaultProps}
            conversationId="test-conv"
          />
        </RouterProvider>,
      );
      expect(screen.getByText("test-form")).toBeInTheDocument();
      expect(screen.getByRole("form")).toBeInTheDocument();
    });
  });

  describe("Error Messages", () => {
    it("renders error message correctly", () => {
      const message: CombinedMessage = {
        type: "ERROR",
        text: "An error occurred",
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    it("renders default error message when text is empty", () => {
      const message: CombinedMessage = {
        type: "ERROR",
        text: "",
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(
        screen.getByText("An error occurred. Please try again."),
      ).toBeInTheDocument();
    });
  });

  describe("Handoff Messages", () => {
    it("renders Salesforce chat message correctly", () => {
      const message: SalesforceChatMessage = {
        type: "ChatMessage",
        message: {
          text: "Agent message",
          name: "John Agent",
          schedule: { responseDelayMilliseconds: 0 },
          agentId: "agent-1",
        },
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Agent message")).toBeInTheDocument();
      expect(screen.getByText("John Agent")).toBeInTheDocument();
    });

    it("renders Zendesk message correctly", () => {
      const message: ZendeskWebhookMessage = {
        type: "handoff-zendesk",
        id: "msg-1",
        createdAt: "2024-01-01T00:00:00Z",
        payload: {
          type: "conversation:message",
          message: {
            id: "msg-1",
            author: {
              type: "user",
              displayName: "Jane Agent",
              avatarUrl: "avatar.png",
            },
            content: {
              type: "text",
              text: "Zendesk message",
            },
            received: "2024-01-01T00:00:00Z",
          },
        },
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Zendesk message")).toBeInTheDocument();
      expect(screen.getByText("Jane Agent")).toBeInTheDocument();
    });

    it("renders Front message correctly", () => {
      const message: Front.WebhookMessage = {
        type: "front-agent",
        id: "msg-1",
        author: {
          id: "author-1",
          first_name: "Sarah",
          last_name: "Agent",
          email: "sarah@example.com",
          username: "sagent",
          is_admin: false,
          is_available: true,
          is_blocked: false,
          _links: {
            self: "link",
            related: { conversations: "link" },
          },
        },
        body: "Front message",
        blurb: "Front message",
        text: "Front message",
        created_at: 123456789,
        is_inbound: true,
        draft_mode: "false",
        error_type: null,
        version: "1.0",
        subject: "Subject",
        _links: {
          self: "link",
          related: {
            channels: "link",
            comments: "link",
            conversation: "link",
            conversations: "link",
            contact: "link",
            events: "link",
          },
        },
        metadata: { headers: { in_reply_to: null } },
        recipients: [],
        attachments: [],
        signature: null,
        is_draft: false,
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("Front message")).toBeInTheDocument();
      expect(screen.getByText("Sarah Agent")).toBeInTheDocument();
    });
  });

  describe("Handoff Event Messages", () => {
    it("renders connecting message correctly", () => {
      const message: IncomingHandoffConnectionEvent = {
        type: SALESFORCE_MESSAGE_TYPES.ChatConnecting,
        timestamp: 123456789,
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("connecting_to_agent")).toBeInTheDocument();
    });

    it("renders queue update message correctly", () => {
      const message: QueueUpdateMessage = {
        type: SALESFORCE_MESSAGE_TYPES.QueueUpdate,
        timestamp: 123456789,
        message: {
          estimatedWaitTime: 300,
          position: 2,
        },
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(
        screen.getByText("chat_queue_position_estimated_wait_time"),
      ).toBeInTheDocument();
    });

    it("renders chat transfer message correctly", () => {
      const message: IncomingHandoffConnectionEvent = {
        type: SALESFORCE_MESSAGE_TYPES.ChatTransferred,
        timestamp: 123456789,
        message: {
          name: "John Agent",
          userId: "user-1",
          sneakPeakEnabled: false,
          isTransferToBot: false,
          chasitorIdleTimeout: {
            isEnabled: false,
            warningTime: 0,
            timeout: 0,
          },
        },
      };

      render(<ChatMessage message={message} {...defaultProps} />);
      expect(screen.getByText("chat_transferred")).toBeInTheDocument();
    });
  });
});
