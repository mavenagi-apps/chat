import { vi, describe, it, expect, beforeEach } from "vitest";
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
    global.fetch = vi.fn();
  });

  describe("GET /api/salesforce/messages", () => {
    const createGetRequest = (headers: Record<string, string> = {}) => ({
      signal: { aborted: false },
      headers: {
        get: vi.fn((key: string) => headers[key]),
      },
    });

    it("should stream messages successfully", async () => {
      const messages = [
        {
          type: "ChatMessage",
          message: { text: "Hello" },
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ messages, sequence: 1, offset: 0 }),
      } as unknown as Response);

      const response = await GET(createGetRequest() as unknown as NextRequest);
      const reader = response.body?.getReader();
      const { value } = (await reader?.read()) || {};
      const text = new TextDecoder().decode(value);

      expect(response.status).toBe(200);
      expect(text).toContain("Hello");
    });

    it("should handle empty message responses", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        status: 204,
      } as Response);

      const response = await GET(createGetRequest() as unknown as NextRequest);
      const reader = response.body?.getReader();
      const { done } = (await reader?.read()) || {};

      expect(response.status).toBe(200);
      expect(done).toBe(true);
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
      vi.mocked(sendChatMessage).mockRejectedValueOnce(
        new Error("Failed to send"),
      );

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toBe("Failed to send chat message");
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
