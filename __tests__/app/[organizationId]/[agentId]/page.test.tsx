import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/[organizationId]/[agentId]/page";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import {
  IncomingHandoffConnectionEvent,
  Message,
  UserChatMessage,
  IncomingHandoffEvent,
} from "@/types";
import { HandoffStatus } from "@/app/constants/handoff";
import { useChat } from "@magi/components/chat/use-chat";
import { useHandoff } from "@/lib/useHandoff";
import { useScrollToBottom } from "@/lib/useScrollToBottom";
import { useIdleMessage } from "@/lib/useIdleMessage";

let chatMessages = [] as Message[];
let handoffMessages = [] as (
  | IncomingHandoffEvent
  | UserChatMessage
  | IncomingHandoffConnectionEvent
)[];

vi.mock("@/lib/useScrollToBottom");
const useScrollToBottomMock = vi.mocked(useScrollToBottom);

vi.mock("@magi/components/chat/use-chat");
const useChatMock = vi.mocked(useChat);

vi.mock("@/lib/useHandoff");
const useHandoffMock = vi.mocked(useHandoff);

vi.mock("@/lib/useIdleMessage");

vi.mock("@/lib/useIframeMessaging", () => ({
  useIframeMessaging: () => ({
    loading: false,
    signedUserData: null,
  }),
}));

vi.mock("@/lib/useAskQuestion", () => ({
  useAskQuestion: vi.fn().mockReturnValue({
    addMessage: vi.fn(),
    isLoading: false,
  }),
}));

describe("ChatPage", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    useScrollToBottomMock.mockReturnValue([
      { current: null },
      { current: null },
    ] as const);

    useChatMock.mockReturnValue({
      messages: chatMessages,
      isLoading: false,
      isResponseAvailable: false,
      addMessage: vi.fn(),
      conversationId: "test-conversation-id",
      mavenUserId: "test-maven-user-id",
    });

    useHandoffMock.mockReturnValue({
      ...useHandoffMock({
        messages: chatMessages,
        mavenConversationId: "test-maven-conversation-id",
      }),
      handoffChatEvents: handoffMessages,
      initializeHandoff: vi.fn(),
      agentName: "Lenny",
      handoffStatus: HandoffStatus.INITIALIZED,
      askHandoff: vi.fn(),
      handleEndHandoff: vi.fn(),
    });
  });

  afterEach(() => {
    [chatMessages, handoffMessages] = [[], []];
    vi.restoreAllMocks();
  });

  describe("when there are no messages", () => {
    test("should render ChatPage with correct initial structure", async () => {
      render(<ChatPage />);

      await screen.findByRole("main");

      expect(screen.getByRole("banner")).toBeInTheDocument(); // ChatHeader
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.getAllByTestId("chat-bubble")).toHaveLength(1); // Welcome message chat bubble
      expect(screen.getByText("Powered by")).toBeInTheDocument(); // Only when there are no messages
    });
  });

  describe("when there are messages", () => {
    beforeEach(() => {
      chatMessages = [
        { timestamp: 100, text: "First message", type: "USER" },
        { timestamp: 300, text: "Third message", type: "USER" },
      ];

      handoffMessages = [
        {
          timestamp: 200,
          createdAt: "2024-01-01",
          id: "1",
          type: "handoff-zendesk",
          payload: {
            message: {
              id: "1",
              author: { type: "user", displayName: "Lenny" },
              content: { type: "text", text: "Second message" },
              received: "2024-01-01",
            },
            type: "conversation:message",
          },
        },
        {
          timestamp: 400,
          createdAt: "2024-01-01",
          id: "2",
          type: "handoff-zendesk",
          payload: {
            message: {
              id: "2",
              author: { type: "user", displayName: "Lenny" },
              content: { type: "text", text: "Fourth message" },
              received: "2024-01-01",
            },
            type: "conversation:message",
          },
        },
      ];

      useChatMock.mockReturnValue({
        ...useChatMock(),
        messages: chatMessages,
      });

      useHandoffMock.mockReturnValue({
        ...useHandoffMock({
          messages: chatMessages,
          mavenConversationId: "test-maven-conversation-id",
        }),
        handoffChatEvents: handoffMessages,
      });
    });

    test("should render ChatPage with correct initial structure", async () => {
      render(<ChatPage />);

      await screen.findByRole("main");

      expect(screen.queryByText("Powered by")).not.toBeInTheDocument();
    });

    describe("message combining logic", () => {
      test("should combine and sort messages correctly", async () => {
        render(<ChatPage />);

        await screen.findByRole("main");

        const getAllChatBubbles = screen.getAllByTestId("chat-bubble");
        expect(getAllChatBubbles).toHaveLength(5);
        [
          "default_welcome_message",
          "First message",
          "Second message",
          "Third message",
          "Fourth message",
        ].forEach((text, index) => {
          expect(getAllChatBubbles[index]).toHaveTextContent(text);
        });
      });
    });
  });
});
