import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatMessages } from "@magi/components/chat/ChatMessages";
import { ChatContext } from "@magi/components/chat/Chat";
import type { Message } from "@/src/types";
import { RouterProvider } from "@/__tests__/utils/test-utils";

describe("ChatMessages", () => {
  const mockMessages: Message[] = [
    {
      type: "USER",
      text: "Hello",
      timestamp: 1,
    },
    {
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
      timestamp: 2,
    },
  ];

  const defaultProps = {
    isLoading: false,
    isResponseAvailable: false,
    mavenUserId: "test-user-id",
    onBailoutFormSubmitSuccess: vi.fn(),
  };

  const mockContextValue = {
    messages: mockMessages,
    conversationId: "test-conv-id",
    addMessage: vi.fn(),
    ask: vi.fn(),
    agentName: null,
    isHandoff: false,
    handleEndHandoff: vi.fn(),
    initializeHandoff: vi.fn(),
    shouldSupressHandoffInputDisplay: false,
    followUpQuestions: [],
    disableAttachments: false,
  };

  it("renders messages correctly", () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatMessages {...defaultProps} />
      </ChatContext.Provider>,
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Bot response")).toBeInTheDocument();
  });

  it("shows loading spinner when loading and no response available", () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatMessages
          {...defaultProps}
          isLoading={true}
          isResponseAvailable={false}
        />
      </ChatContext.Provider>,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument(); // Spinner has role="status"
  });

  it("does not show loading spinner when response is available", () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatMessages
          {...defaultProps}
          isLoading={true}
          isResponseAvailable={true}
        />
      </ChatContext.Provider>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("passes onBailoutFormSubmitSuccess to ChatMessage", () => {
    const onBailoutFormSubmitSuccess = vi.fn();
    const actionMessage: Message = {
      type: "bot",
      botMessageType: "BOT_RESPONSE",
      responses: [{ type: "text", text: "Action message" }],
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
      timestamp: 3,
      action: {
        id: "test-action",
        formLabel: "test-form",
        fields: [],
        submitLabel: "test-submit",
      },
    };

    render(
      <RouterProvider>
        <ChatContext.Provider
          value={{ ...mockContextValue, messages: [actionMessage] }}
        >
          <ChatMessages
            {...defaultProps}
            onBailoutFormSubmitSuccess={onBailoutFormSubmitSuccess}
          />
        </ChatContext.Provider>
      </RouterProvider>,
    );

    expect(screen.getByText("test-form")).toBeInTheDocument();
  });
});
