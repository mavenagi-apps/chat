import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { GET, POST } from "@/app/api/salesforce/messages/route";
import { NextRequest, NextResponse } from "next/server";
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

      beforeEach(() => {
        mockController = {
          enqueue: vi.fn(),
          close: vi.fn(),
          error: vi.fn(),
        };

        global.console.error = vi.fn();

        // Mock ReadableStream to capture controller
        global.ReadableStream = vi.fn().mockImplementation(({ start }) => {
          start(mockController);
          return {};
        });
      });

      it("handles 403 errors gracefully during stream", async () => {
        // Mock fetch to fail with 403
        const mockFetch = global.fetch as Mock;
        mockFetch.mockImplementation(() =>
          Promise.resolve({
            ok: false,
            status: 403,
          }),
        );

        const mockRequest = createGetRequest({}, 0); // Abort immediately after first check
        await GET(mockRequest);

        expect(global.console.error).not.toHaveBeenCalled();
        expect(mockController.close).toHaveBeenCalled();
      });

      it("throws an error if 403 does not coincide with an aborted stream", async () => {
        // Mock fetch to fail with 403
        const mockFetch = global.fetch as Mock;
        mockFetch.mockImplementation(() =>
          Promise.resolve({
            ok: false,
            status: 403,
          }),
        );

        const mockRequest = createGetRequest({}, 2); // Allow a couple of checks before aborting
        await GET(mockRequest);

        expect(global.console.error).toHaveBeenCalled();
        expect(mockController.close).toHaveBeenCalled();
      });
    });
  });

  describe("POST /api/salesforce/messages", () => {
    const createPostRequest = (message = "Test message") => ({
      json: vi.fn().mockResolvedValue({ message }),
    });

    it("should send message successfully", async () => {
      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toBe("Chat message sent");
    });

    it("should handle send message failure", async () => {
      // mock console.error once
      const originalConsoleError = global.console.error;
      global.console.error = vi.fn();
      vi.mocked(sendChatMessage).mockRejectedValueOnce(
        new Error("Failed to send"),
      );

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toBe("Failed to send chat message");
      expect(global.console.error).toHaveBeenCalledOnce();
      // reset console.error
      global.console.error = originalConsoleError;
    });

    it("should validate configuration", async () => {
      vi.mocked(validateSalesforceConfig).mockReturnValueOnce(
        new NextResponse(JSON.stringify({ error: "Invalid configuration" }), {
          status: 400,
        }),
      );

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
