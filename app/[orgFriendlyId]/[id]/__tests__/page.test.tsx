import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatPageWrapper from "../page";
import { useIframeMessaging } from "@/lib/useIframeMessaging";
import { useChat } from "@magi/components/chat/use-chat";
import { useHandoff } from "@/lib/useHandoff";
import { HandoffStatus } from "@/app/constants/handoff";
import { useParams } from "next/navigation";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import type { Message } from "@/types";

// Mock all the hooks and dependencies
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/lib/useIframeMessaging", () => ({
  useIframeMessaging: vi.fn(),
}));

vi.mock("@magi/components/chat/use-chat", () => ({
  useChat: vi.fn(),
}));

vi.mock("@/lib/useHandoff", () => ({
  useHandoff: vi.fn(),
}));

vi.mock("@/lib/use-analytics", () => ({
  useAnalytics: vi.fn(),
}));

vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: () => ({
    brandColor: "#000000",
    logoUrl: "test-logo.png",
  }),
}));

describe("ChatPage", () => {
  beforeEach(() => {
    // Setup default mock implementations
    vi.mocked(useParams).mockReturnValue({
      orgFriendlyId: "test-org",
      id: "test-id",
    });

    vi.mocked(useIframeMessaging).mockReturnValue({
      loading: false,
      signedUserData: null,
      unsignedUserData: null,
      customData: {},
    });

    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isResponseAvailable: false,
      askQuestion: vi.fn(),
      conversationId: "test-conversation",
      mavenUserId: "test-user",
    });

    vi.mocked(useHandoff).mockReturnValue({
      initializeHandoff: vi.fn(),
      handoffChatEvents: [],
      agentName: "",
      handoffStatus: HandoffStatus.NOT_INITIALIZED,
      askHandoff: vi.fn(),
      handleEndHandoff: vi.fn(),
      handoffError: null,
      isConnected: false,
    });

    vi.mocked(useAnalytics).mockReturnValue({
      logEvent: vi.fn(),
      init: vi.fn(),
    });
  });

  it("renders the chat page with welcome message", () => {
    render(<ChatPageWrapper />);
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  it("shows loading state correctly", () => {
    vi.mocked(useIframeMessaging).mockReturnValue({
      loading: true,
      signedUserData: null,
      unsignedUserData: null,
      customData: {},
    });

    const { container } = render(<ChatPageWrapper />);
    expect(container).toBeEmptyDOMElement();
  });

  it("logs analytics event on mount", () => {
    const mockLogEvent = vi.fn();
    vi.mocked(useAnalytics).mockReturnValue({
      logEvent: mockLogEvent,
      init: vi.fn(),
    });

    render(<ChatPageWrapper />);

    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.chatHomeView, {
      agentId: "test-id",
    });
  });

  it("handles handoff state correctly", () => {
    vi.mocked(useHandoff).mockReturnValue({
      initializeHandoff: vi.fn(),
      handoffChatEvents: [],
      agentName: "Test Agent",
      handoffStatus: HandoffStatus.INITIALIZED,
      askHandoff: vi.fn(),
      handleEndHandoff: vi.fn(),
      handoffError: null,
      isConnected: true,
    });

    render(<ChatPageWrapper />);
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("combines and sorts messages correctly", () => {
    const chatMessages: Message[] = [
      {
        conversationMessageId: "1",
        text: "Message 1",
        type: "USER",
        timestamp: 1000,
        attachments: [],
        userId: "test-user",
        userMessageType: "text",
      },
      {
        conversationMessageId: "2",
        text: "Message 2",
        type: "bot",
        timestamp: 2000,
        attachments: [],
        userId: "test-user",
        userMessageType: "text",
      },
    ];

    const handoffEvents = [
      {
        type: "chat_established",
        agentName: "Agent",
        timestamp: 1500,
        conversationId: "test-conv",
      },
    ];

    vi.mocked(useChat).mockReturnValue({
      messages: chatMessages,
      isLoading: false,
      isResponseAvailable: false,
      askQuestion: vi.fn(),
      conversationId: "test-conversation",
      mavenUserId: "test-user",
    });

    vi.mocked(useHandoff).mockReturnValue({
      initializeHandoff: vi.fn(),
      handoffChatEvents: handoffEvents,
      agentName: "",
      handoffStatus: HandoffStatus.NOT_INITIALIZED,
      askHandoff: vi.fn(),
      handleEndHandoff: vi.fn(),
      handoffError: null,
      isConnected: false,
    });

    render(<ChatPageWrapper />);

    const messageElements = screen.getAllByRole("listitem");
    expect(messageElements).toHaveLength(3);
    expect(messageElements[0]).toHaveTextContent("Message 1");
    expect(messageElements[1]).toHaveTextContent("Handoff 1");
    expect(messageElements[2]).toHaveTextContent("Message 2");
  });

  it("shows powered by Maven when no messages", () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isResponseAvailable: false,
      askQuestion: vi.fn(),
      conversationId: "test-conversation",
      mavenUserId: "test-user",
    });

    render(<ChatPageWrapper />);
    expect(screen.getByTestId("powered-by-maven")).toBeInTheDocument();
  });
});
