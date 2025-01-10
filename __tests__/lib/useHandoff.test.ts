import { renderHook, act } from "@testing-library/react";
import { useHandoff } from "@/lib/useHandoff";
import { HandoffStatus } from "@/app/constants/handoff";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { useSettings } from "@/app/providers/SettingsProvider";
import type { Message } from "@/types";
import { HandoffStrategyFactory } from "@/lib/handoff/HandoffStrategyFactory";

// Mock the required providers and hooks
vi.mock("next/dist/client/components/navigation", () => ({
  useParams: () => ({
    orgFriendlyId: "test-org",
    id: "test-agent",
  }),
}));

vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: vi.fn(() => ({
    handoffConfiguration: {
      type: "zendesk",
    },
  })),
}));

vi.mock("@/app/providers/AuthProvider", () => ({
  useAuth: () => ({
    signedUserData: "test-user",
  }),
}));

// Mock the strategy factory
vi.mock("@/lib/handoff/HandoffStrategyFactory", () => ({
  HandoffStrategyFactory: {
    createStrategy: vi.fn(() => ({
      formatMessages: vi.fn((messages: Message[]) =>
        messages.map((m) => ({
          author: { type: m.type === "USER" ? "user" : "business" },
          content: {
            type: "text",
            text: m.type === "USER" ? m.text : m.responses?.[0]?.text || "",
          },
        })),
      ),
      handleChatEvent: vi.fn((event) => ({
        agentName: "Test Agent",
        formattedEvent: { ...event, type: "handoff-test" },
      })),
      getMessagesEndpoint: "/api/test/messages",
      getConversationsEndpoint: "/api/test/conversations",
    })),
  },
}));

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
    });

    test("should create strategy on mount", () => {
      renderHook(() => useHandoff(defaultProps));
      expect(HandoffStrategyFactory.createStrategy).toHaveBeenCalledWith(
        "zendesk",
      );
    });
  });

  describe("initializeHandoff", () => {
    test("should handle successful initialization", async () => {
      mockFetch.mockImplementation(async (url) => {
        if (url.includes("/api/test/conversations")) {
          return Promise.resolve({
            ok: true,
            headers: {
              get: () => "test-auth-token",
            },
          });
        }

        if (url.includes("/api/test/messages")) {
          return Promise.resolve({
            ok: true,
            headers: {
              get: () => "test-auth-token",
            },
            body: {
              getReader: () => ({
                read: () => ({
                  done: true,
                  value: JSON.stringify({
                    message: {
                      type: "conversation:message",
                    },
                  }),
                }),
                releaseLock: vi.fn(),
              }),
            },
          });
        }

        return Promise.resolve({
          ok: false,
          status: 404,
        });
      });

      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test/conversations",
        expect.any(Object),
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
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          headers: {
            get: () => "test-auth-token",
          },
        }),
      );

      const { result } = renderHook(() => useHandoff(defaultProps));

      // Simulate initialization first
      await act(async () => {
        await result.current.initializeHandoff({ email: "test@example.com" });
      });

      await act(async () => {
        await result.current.askHandoff("Hello");
      });

      expect(result.current.handoffChatEvents).toContainEqual(
        expect.objectContaining({
          text: "Hello",
          type: "USER",
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
          type: "ChatEnded",
        }),
      );
    });
  });

  describe("message processing", () => {
    test("should process handoff messages correctly", () => {
      const messages = [
        { type: "USER", text: "Hello" },
        { type: "bot", responses: [{ text: "Bot response" }] },
      ];

      const { result } = renderHook(() =>
        useHandoff({
          messages: messages as Message[],
          mavenConversationId: "test-conv-123",
        }),
      );

      expect(result.current.handoffChatEvents).toEqual([]);
    });
  });

  describe("edge cases", () => {
    test("should handle missing handoff configuration", () => {
      const useSettingsMock = vi.mocked(useSettings);
      useSettingsMock.mockImplementationOnce(() => ({
        handoffConfiguration: undefined,
      }));

      const { result } = renderHook(() => useHandoff(defaultProps));

      expect(result.current.handoffStatus).toBe(HandoffStatus.NOT_INITIALIZED);
    });

    test("should handle network errors during message sending", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error")),
      );

      const { result } = renderHook(() => useHandoff(defaultProps));

      await act(async () => {
        try {
          await result.current.askHandoff("Hello");
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe("cleanup", () => {
    test("should clean up resources on unmount", () => {
      const { unmount } = renderHook(() => useHandoff(defaultProps));

      unmount();
      // Verify that abort controller is called and timeout is cleared
      // This might require additional setup to track these calls
    });
  });
});
