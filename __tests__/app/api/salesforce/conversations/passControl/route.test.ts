import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "@/src/app/api/salesforce/conversations/passControl/route";
import { NextRequest, NextResponse } from "next/server";
import { validateSalesforceConfig } from "@/src/app/api/salesforce/utils";

// Mock external dependencies
vi.mock("@/src/app/api/server/utils", () => ({
  withSettingsAndAuthentication: vi.fn((req, handler) =>
    handler(
      req,
      {
        branding: {},
        security: {},
        misc: {
          handoffConfiguration: {
            type: "salesforce",
            chatHostUrl: "https://test.salesforce.com",
            apiSecret: "test-secret",
          },
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

vi.mock("@/src/app/api/salesforce/utils", async () => {
  const actual = await vi.importActual("@/src/app/api/salesforce/utils");
  return {
    ...(actual as object),
    validateSalesforceConfig: vi.fn(),
    validateAuthHeaders: vi.fn(),
    generateSessionInitRequestHeaders: vi.fn(),
  };
});

describe("POST /api/salesforce/conversations/passControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.stubGlobal("console", { ...console, error: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createMockRequest = () => ({
    json: vi.fn().mockResolvedValue({}),
  });

  describe("Chat Session End", () => {
    it("should successfully end chat session", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://test.salesforce.com/chat/rest/System/SessionId/test-session-key",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("should handle session end failure", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
      expect(console.error).toHaveBeenCalledWith(
        "endChatSession failed:",
        expect.any(Error),
      );
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network error");
      vi.mocked(global.fetch).mockRejectedValueOnce(networkError);

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
      expect(console.error).toHaveBeenCalledWith(
        "endChatSession failed:",
        networkError,
      );
    });
  });

  describe("Configuration Validation", () => {
    it("should handle invalid configuration", async () => {
      vi.mocked(validateSalesforceConfig).mockReturnValueOnce(
        NextResponse.json(
          { success: false, error: "Invalid Salesforce configuration" },
          { status: 400 },
        ),
      );

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Invalid Salesforce configuration",
      });
    });
  });
});
