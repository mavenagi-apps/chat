import { renderHook, act } from "@testing-library/react";
import { useHandoff } from "@/src/lib/useHandoff";
import { HandoffStatus } from "@/src/app/constants/handoff";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import type {
  Message,
  UserChatMessage,
  IncomingHandoffEvent,
} from "@/src/types";
import { HandoffStrategyFactory } from "@/src/lib/handoff/HandoffStrategyFactory";
import { SALESFORCE_MESSAGE_TYPES } from "@/src/types/salesforce";
import { streamResponse } from "@/src/lib/handoff/streamUtils";
import { useSettings } from "@/src/app/providers/SettingsProvider";

// Mock the required providers and hooks
vi.mock("next/dist/client/components/navigation", () => ({
  useParams: () => ({
    organizationId: "test-org",
    agentId: "test-agent",
  }),
}));

vi.mock("@/src/app/providers/SettingsProvider", () => ({
  useSettings: vi.fn(() => ({
    branding: {},
    security: {},
    misc: {
      handoffConfiguration: {
        type: "zendesk",
      },
    },
  })),
}));

vi.mock("@/src/app/providers/AuthProvider", () => ({
  useAuth: () => ({
    signedUserData: "test-user",
    unsignedUserData: null,
  }),
}));

vi.mock("@/src/app/providers/CustomDataProvider", () => ({
  useCustomData: () => ({
    customData: {},
  }),
}));

// Mock stream response utility
vi.mock("@/src/lib/handoff/streamUtils", () => ({
  streamResponse: vi.fn(async function* () {
    yield { type: "test-event" };
  }),
}));

const createMockStrategy = () => ({
  formatMessages: vi.fn((messages: Message[]) =>
    messages.map((m) => ({
      author: { type: m.type === "USER" ? "user" : "business" },
      content: {
        type: "text",
        text: m.type === "USER" ? (m as UserChatMessage).text : "",
      },
    })),
  ),
  handleChatEvent: vi.fn((event) => {
    if (event.type === SALESFORCE_MESSAGE_TYPES.ChatRequestFail) {
      return { shouldEndHandoff: true };
    }
    return {
      agentName: "Test Agent",
      formattedEvent: { ...event, type: "handoff-test" },
    };
  }),
  messagesEndpoint: "/api/test/messages",
  conversationsEndpoint: "/api/test/conversations",
  showAgentTypingIndicator: vi.fn(() => false),
  shouldSupressHandoffInputDisplay: vi.fn(() => false),
});

// Mock the strategy factory
vi.mock("@/src/lib/handoff/HandoffStrategyFactory", () => ({
  HandoffStrategyFactory: {
    createStrategy: vi.fn(() => createMockStrategy()),
  },
}));

const createSuccessfulResponse = (
  includeBody = false,
  messageType = "conversation:message",
) =>
  Promise.resolve({
    ok: true,
    headers: {
      get: (header: string) =>
        header.toLowerCase() === "x-handoff-auth-token".toLowerCase()
          ? "test-auth-token"
          : null,
    },
    ...(includeBody && {
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new TextEncoder().encode(
              JSON.stringify({
                message: { type: messageType },
              }),
            ),
          }),
          releaseLock: vi.fn(),
        }),
      },
    }),
  });

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useHandoff", () => {
  const defaultProps = {
    messages: [],
    mavenConversationId: "test-conv-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("initialization", () => {
    test("should initialize with default values", () => {
      const { result } = renderHook(() => useHandoff(defaultProps));

      expect(result.current.handoffStatus).toBe(HandoffStatus.NOT_INITIALIZED);
      expect(result.current.handoffError).toBeNull();
      expect(result.current.handoffChatEvents).toEqual([]);
      expect(result.current.agentName).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.showTypingIndicator).toBe(false);
      expect(result.current.shouldSupressHandoffInputDisplay).toBe(false);
    });

    test("should create strategy with configuration on mount", () => {
      const handoffConfig = {
        type: "salesforce" as const,
        orgId: "test-org",
        chatHostUrl: "test-url",
        chatButtonId: "test-button",
        deploymentId: "test-deployment",
        eswLiveAgentDevName: "test-name",
        apiSecret: "test-secret",
        handoffTerminatingMessageText: "goodbye",
        enableAvailabilityCheck: true,
      };

      vi.mocked(useSettings).mockReturnValue({
        branding: {},
        security: {},
        misc: {
          handoffConfiguration: handoffConfig,
        },
      });

      renderHook(() => useHandoff(defaultProps));
      expect(HandoffStrategyFactory.createStrategy).toHaveBeenCalledWith(
        "salesforce",
        handoffConfig,
      );
    });
  });

  describe("initializeHandoff", () => {
    test("should handle successful initialization", async () => {
      mockFetch.mockImplementation(async (url) => {
        if (url.includes("/api/test/conversations")) {
          return createSuccessfulResponse();
        }
        return Promise.resolve({ ok: true });
      });

      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test/conversations",
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        }),
      );
    });

    test("should handle initialization failure", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(result.current.handoffStatus).toBe(HandoffStatus.NOT_INITIALIZED);
    });
  });

  describe("askHandoff", () => {
    test("should send message successfully", async () => {
      // Mock both the initialization and message sending responses
      mockFetch.mockImplementation(async (url) => {
        if (url.includes("/api/test/conversations")) {
          return createSuccessfulResponse();
        }
        if (url.includes("/api/test/messages")) {
          return createSuccessfulResponse(true);
        }
        return Promise.resolve({ ok: true });
      });

      const { result } = renderHook(() => useHandoff(defaultProps));

      // Initialize handoff first
      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      // Send message
      await act(async () => {
        await result.current.askHandoff("Hello");
      });

      expect(result.current.handoffChatEvents).toContainEqual(
        expect.objectContaining({
          text: "Hello",
          type: "USER",
        }),
      );

      // Verify the message was sent
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test/messages",
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
          headers: expect.any(Object),
        }),
      );
    });
  });

  describe("handleEndHandoff", () => {
    test("should clean up handoff state", async () => {
      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.handleEndHandoff();
      });

      expect(result.current.handoffStatus).toBe(HandoffStatus.NOT_INITIALIZED);
      expect(result.current.agentName).toBeNull();
      expect(result.current.handoffChatEvents).toContainEqual(
        expect.objectContaining({
          type: SALESFORCE_MESSAGE_TYPES.ChatEnded,
        }),
      );
    });
  });

  describe("cleanup", () => {
    test("should clean up resources on unmount", async () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      mockFetch.mockImplementation(async (url) => {
        if (url.includes("/api/test/conversations")) {
          return createSuccessfulResponse();
        }
        if (url.includes("/api/test/messages")) {
          return createSuccessfulResponse(true);
        }
        return Promise.resolve({ ok: true });
      });

      const { result, unmount } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(result.current.handoffStatus).toBe(HandoffStatus.INITIALIZED);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("handleHandoffChatEvent", () => {
    beforeEach(() => {
      mockFetch.mockImplementation(async (url) => {
        if (url.includes("/api/test/conversations")) {
          return createSuccessfulResponse();
        }
        if (url.includes("/api/test/messages")) {
          return createSuccessfulResponse(true);
        }
        return Promise.resolve({ ok: true });
      });
    });

    test("should end handoff on terminating chat events", async () => {
      const { result } = renderHook(() => useHandoff(defaultProps));
      vi.mocked(streamResponse).mockImplementationOnce(async function* () {
        yield {
          type: SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
          timestamp: Date.now(),
          message: { reason: "Chat request failed" },
        } as unknown as IncomingHandoffEvent;
      });

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(result.current.handoffStatus).toBe(HandoffStatus.NOT_INITIALIZED);
    });

    test("should not end handoff on non-terminating chat events", async () => {
      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(result.current.handoffStatus).toBe(HandoffStatus.INITIALIZED);
    });
  });
});
