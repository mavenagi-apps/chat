import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { GET, POST } from "@/app/api/salesforce/messages/route";
import { NextRequest } from "next/server";
import {
  sendChatMessage,
  validateSalesforceConfig,
} from "@/app/api/salesforce/utils";

// Mock external dependencies
vi.mock("@/app/api/server/utils", () => ({
  withSettingsAndAuthentication: vi.fn((req, handler) =>
    handler(
      req,
      {
        handoffConfiguration: {
          type: "salesforce",
          chatHostUrl: "https://test.salesforce.com",
          apiSecret: "test-secret",
        },
      },
      "test-org-id",
      "test-agent-id",
      "test-user-id",
      "test-conversation-id",
      {
        affinityToken: "test-affinity-token",
        sessionKey: "test-session-key",
      },
    ),
  ),
}));

vi.mock("@/app/api/salesforce/utils", async () => {
  const actual = await vi.importActual("@/app/api/salesforce/utils");
  return {
    ...(actual as object),
    validateSalesforceConfig: vi.fn(),
    validateAuthHeaders: vi.fn(),
    sendChatMessage: vi.fn(),
  };
});

describe("Salesforce Messages API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof global.fetch;
  });

  describe("GET /api/salesforce/messages", () => {
    const createGetRequest = (
      headers: Record<string, string> = {},
      abortAfterCalls = 1,
    ) => {
      let callCount = 0;
      return {
        signal: {
          get aborted() {
            callCount++;
            return callCount > abortAfterCalls;
          },
        },
        headers: {
          get: vi.fn((key: string) => headers[key]),
        },
      } as unknown as NextRequest;
    };

    it("should stream messages successfully", async () => {
      const messages = [
        {
          type: "ChatMessage",
          message: { text: "Hello" },
        },
      ];

      const mockFetch = global.fetch as Mock;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ messages, sequence: 1, offset: 0 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 2, offset: 1 }),
        } as Response);

      // Allow 2 fetch calls before aborting
      const response = await GET(createGetRequest({}, 2));
      const reader = response.body?.getReader();
      const { value } = (await reader?.read()) || {};
      const text = new TextDecoder().decode(value);

      expect(response.status).toBe(200);
      expect(text).toContain("Hello");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle empty message responses", async () => {
      const mockFetch = global.fetch as Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
      } as Response);

      // Abort after first call
      const response = await GET(createGetRequest({}, 1));
      const reader = response.body?.getReader();
      const { done } = (await reader?.read()) || {};

      expect(response.status).toBe(200);
      expect(done).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    describe("Error Handling", () => {
      let mockController: { enqueue: Mock; close: Mock; error: Mock };
      let mockReader: { read: Mock };

      beforeEach(() => {
        mockController = {
          enqueue: vi.fn(),
          close: vi.fn(),
          error: vi.fn(),
        };

        mockReader = {
          read: vi.fn().mockResolvedValue({ done: true }),
        };

        global.console.error = vi.fn();

        // Mock ReadableStream to properly handle streaming
        global.ReadableStream = vi.fn().mockImplementation(({ start }) => {
          // Start the stream controller immediately
          start(mockController);
          return {
            getReader: () => mockReader,
          };
        });
      });

      it("handles 403 errors gracefully during stream", async () => {
        const mockFetch = global.fetch as Mock;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        // Use request that aborts immediately
        const response = await GET(createGetRequest({}, 0));

        // Verify stream was created with correct headers
        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
        expect(mockController.close).toHaveBeenCalled();
        expect(global.console.error).not.toHaveBeenCalled();
      });

      it("throws an error if 403 does not coincide with an aborted stream", async () => {
        const mockFetch = global.fetch as Mock;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        // Use request that doesn't abort immediately
        const response = await GET(createGetRequest({}, 2));

        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
        expect(mockController.close).toHaveBeenCalled();
        expect(global.console.error).toHaveBeenCalled();
      });
    });
  });

  describe("POST /api/salesforce/messages", () => {
    const createPostRequest = (message = "Test message") => ({
      json: vi.fn().mockResolvedValue({ message }),
    });

    it("should send message successfully", async () => {
      vi.mocked(sendChatMessage).mockResolvedValueOnce(undefined);

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(await response.json()).toBe("Chat message sent");
    });

    it("should handle send message failure", async () => {
      const originalConsoleError = global.console.error;
      global.console.error = vi.fn();

      vi.mocked(sendChatMessage).mockRejectedValueOnce(
        new Error("Failed to send"),
      );

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
      expect(await response.json()).toBe("Failed to send chat message");
      expect(global.console.error).toHaveBeenCalledOnce();

      global.console.error = originalConsoleError;
    });

    it("should validate configuration", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Invalid configuration" }),
        {
          status: 400,
        },
      );
      vi.mocked(validateSalesforceConfig).mockReturnValueOnce(mockResponse);

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid configuration",
      });
    });
  });
});
