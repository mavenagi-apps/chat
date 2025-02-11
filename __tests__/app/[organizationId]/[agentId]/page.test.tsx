// External packages
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

// Types
import type {
  IncomingHandoffConnectionEvent,
  Message,
  UserChatMessage,
  IncomingHandoffEvent,
} from "@/types";

// Constants
import { HandoffStatus } from "@/app/constants/handoff";

// Hooks
import { useChat } from "@magi/components/chat/use-chat";
import { useHandoff } from "@/lib/useHandoff";
import { useScrollToBottom } from "@/lib/useScrollToBottom";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useIdleMessage } from "@/lib/useIdleMessage";

// Components
import ChatPage from "@/app/[organizationId]/[agentId]/page";

// Test setup
let chatMessages = [] as Message[];
let handoffMessages = [] as (
  | IncomingHandoffEvent
  | UserChatMessage
  | IncomingHandoffConnectionEvent
)[];

// Mocks
vi.mock("@/lib/useScrollToBottom");
const useScrollToBottomMock = vi.mocked(useScrollToBottom);

vi.mock("@magi/components/chat/use-chat");
const useChatMock = vi.mocked(useChat);

vi.mock("@/lib/useHandoff");
const useHandoffMock = vi.mocked(useHandoff);

vi.mock("@/lib/useIdleMessage");
const useIdleMessageMock = vi.mocked(useIdleMessage);

vi.mock("@/app/providers/SettingsProvider");
const useSettingsMock = vi.mocked(useSettings);

vi.mock("@/lib/useIframeMessaging", () => ({
  useIframeMessaging: () => ({
    loading: false,
    signedUserData: null,
    unsignedUserData: null,
    customData: null,
  }),
}));

vi.mock("@/lib/useAskQuestion", () => ({
  useAskQuestion: vi.fn().mockReturnValue({
    addMessage: vi.fn(),
    isLoading: false,
  }),
}));

describe("ChatPage Component", () => {
  describe("Component Integration", () => {
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
        onBailoutFormSubmitSuccess: vi.fn(),
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

      useSettingsMock.mockReturnValue({
        branding: {},
        misc: {
          enableIdleMessage: true,
          handoffConfiguration: {
            type: "salesforce",
            enableAvailabilityCheck: true,
            allowAnonymousHandoff: false,
          },
        },
        security: {},
      });
    });

    afterEach(() => {
      [chatMessages, handoffMessages] = [[], []];
      vi.restoreAllMocks();
    });

    describe("idle message integration", () => {
      test("should initialize idle message hook with correct configuration", () => {
        render(<ChatPage />);

        expect(useIdleMessageMock).toHaveBeenCalledWith({
          messages: chatMessages,
          conversationId: "test-conversation-id",
          agentName: "Lenny",
          addMessage: expect.any(Function),
        });
      });
    });

    describe("initial render", () => {
      test("should display welcome message and core UI elements when no messages exist", async () => {
        render(<ChatPage />);

        await screen.findByRole("main");

        expect(screen.getByRole("banner")).toBeInTheDocument(); // ChatHeader
        expect(screen.getByRole("main")).toBeInTheDocument();
        expect(screen.getByTestId("chat-input")).toBeInTheDocument();
        expect(screen.getAllByTestId("chat-bubble")).toHaveLength(1); // Welcome message chat bubble
        expect(screen.getByText("Powered by")).toBeInTheDocument(); // Only when there are no messages
      });
    });

    describe("message handling", () => {
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

      test("should hide powered by text when messages exist", async () => {
        render(<ChatPage />);
        await screen.findByRole("main");
        expect(screen.queryByText("Powered by")).not.toBeInTheDocument();
      });

      describe("message ordering", () => {
        test("should display messages in chronological order with welcome message first", async () => {
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
});
