import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/[orgFriendlyId]/[id]/page";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { HandoffChatMessage, Message } from "@/types";
import { HandoffStatus } from "@/app/constants/handoff";
import { useChat } from "@magi/components/chat/use-chat";
import { useHandoff } from "@/lib/useHandoff";

let chatMessages = [] as Message[];
let handoffMessages = [] as HandoffChatMessage[];

vi.mock("@magi/components/chat/use-chat");
const useChatMock = vi.mocked(useChat);

vi.mock("@/lib/useHandoff");
const useHandoffMock = vi.mocked(useHandoff);

vi.mock("@/lib/useIframeMessaging", () => ({
  useIframeMessaging: () => ({
    loading: false,
    signedUserData: null,
  }),
}));

vi.mock("@/lib/useAskQuestion", () => ({
  useAskQuestion: vi.fn().mockReturnValue({
    askQuestion: vi.fn(),
    isLoading: false,
  }),
}));

let mockScrollToLatest = vi.fn();
vi.mock("@/lib/useScrollToLatest", () => ({
  useScrollToLatest: () => ({
    scrollToLatest: mockScrollToLatest,
    latestChatBubbleRef: { current: null },
  }),
}));

describe("ChatPage", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useChatMock.mockReturnValue({
      messages: chatMessages,
      isLoading: false,
      isResponseAvailable: false,
      askQuestion: vi.fn(),
      conversationId: "test-conversation-id",
    });

    useHandoffMock.mockReturnValue({
      ...useHandoffMock({ messages: chatMessages }),
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
        ...useHandoffMock({ messages: chatMessages }),
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

  describe("scroll behavior", () => {
    beforeEach(() => {
      chatMessages = [
        { timestamp: 100, text: "First message", type: "USER" },
        { timestamp: 300, text: "Third message", type: "USER" },
      ];
    });

    test("should call scrollToLatest when messages change", () => {
      render(<ChatPage />);
      expect(mockScrollToLatest).toHaveBeenCalledTimes(1);

      chatMessages.push({ timestamp: 500, text: "New message", type: "USER" });

      render(<ChatPage />);
      expect(mockScrollToLatest).toHaveBeenCalledTimes(2);
    });
  });
});
