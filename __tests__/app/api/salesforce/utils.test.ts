import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  validateSalesforceConfig,
  validateAuthHeaders,
  sendChatMessage,
  convertMessagesToTranscriptText,
  generateSessionInitRequestHeaders,
  generateSessionInitRequestBody,
  fetchChatMessages,
  ChatMessagesError,
  SALESFORCE_API_BASE_HEADERS,
} from "@/app/api/salesforce/utils";
import type {
  ChatSessionResponse,
  SalesforceChatUserData,
} from "@/types/salesforce";
import type { Message } from "@/types";
import { MavenAGI } from "mavenagi";
import { BotConversationMessageType } from "mavenagi/api";
import { SALESFORCE_API_VERSION } from "@/app/constants/handoff";

const createBotMessage = (text: string, id = 1) => ({
  type: "bot" as const,
  responses: [{ type: "text" as const, text }],
  conversationMessageId: {
    referenceId: `msg-${id}`,
    type: MavenAGI.EntityType.ConversationMessage,
    appId: "app-123",
    organizationId: "org-123",
    agentId: "agent-123",
  },
  botMessageType: BotConversationMessageType.BotResponse,
  metadata: {
    followupQuestions: [],
    sources: [],
  },
});

describe("Salesforce Utils", () => {
  describe("validateSalesforceConfig", () => {
    it("should return null for valid salesforce configuration", () => {
      const config = {
        type: "salesforce",
        chatHostUrl: "https://test.salesforce.com",
      };
      expect(validateSalesforceConfig(config)).toBeNull();
    });

    it("should return error response for invalid configuration type", () => {
      const config = {
        type: "invalid",
        chatHostUrl: "https://test.salesforce.com",
      };
      const response = validateSalesforceConfig(config);
      expect(response?.status).toBe(400);
      expect(response?.json()).resolves.toEqual({
        success: false,
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      });
    });

    it("should return error response for undefined configuration", () => {
      const response = validateSalesforceConfig(undefined);
      expect(response?.status).toBe(400);
      expect(response?.json()).resolves.toEqual({
        success: false,
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      });
    });
  });

  describe("validateAuthHeaders", () => {
    it("should return null when both headers are present", () => {
      expect(validateAuthHeaders("affinity-token", "session-key")).toBeNull();
    });

    it("should return error response when affinity token is missing", () => {
      const response = validateAuthHeaders(undefined, "session-key");
      expect(response?.status).toBe(401);
      expect(response?.json()).resolves.toBe("Missing auth headers");
    });

    it("should return error response when session key is missing", () => {
      const response = validateAuthHeaders("affinity-token", undefined);
      expect(response?.status).toBe(401);
      expect(response?.json()).resolves.toBe("Missing auth headers");
    });
  });

  describe("sendChatMessage", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
      vi.stubGlobal("console", { ...console, error: vi.fn() });
    });

    it("sends message successfully", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await expect(
        sendChatMessage("test message", "token", "key", "https://test.url"),
      ).resolves.toBeDefined();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://test.url/chat/rest/Chasitor/ChatMessage",
        expect.objectContaining({
          method: "POST",
          headers: {
            ...SALESFORCE_API_BASE_HEADERS,
            "X-LIVEAGENT-AFFINITY": "token",
            "X-LIVEAGENT-SESSION-KEY": "key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: "test message" }),
        }),
      );
    });

    it("throws error when request fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(
        sendChatMessage("test message", "token", "key", "https://test.url"),
      ).rejects.toThrow("Failed to send chat message");
    });
  });

  describe("convertMessagesToTranscriptText", () => {
    it("should format user messages correctly", () => {
      const messages = [
        { type: "USER", text: "Hello" },
        { type: "USER", text: "How are you?" },
      ] as Message[];
      const transcript = convertMessagesToTranscriptText(messages);
      expect(transcript).toBe(
        "MAVEN TRANSCRIPT HISTORY\n\nVisitor: Hello\n\nVisitor: How are you?",
      );
    });

    it("should format bot messages correctly", () => {
      const messages = [
        {
          type: "bot",
          responses: [
            { type: "text", text: "Hi there!" },
            { type: "text", text: "I'm doing well" },
          ],
        },
      ] as Message[];
      const transcript = convertMessagesToTranscriptText(messages);
      expect(transcript).toBe(
        "MAVEN TRANSCRIPT HISTORY\n\nMaven bot: Hi there!I'm doing well",
      );
    });

    it("should handle mixed message types", () => {
      const messages = [
        { type: "USER", text: "Hello" },
        {
          type: "bot",
          text: "",
          responses: [{ type: "text", text: "Hi there!" }],
        },
      ] as Message[];
      const transcript = convertMessagesToTranscriptText(messages);
      expect(transcript).toBe(
        "MAVEN TRANSCRIPT HISTORY\n\nVisitor: Hello\n\nMaven bot: Hi there!",
      );
    });

    it("should handle newlines in bot responses", () => {
      const messages = [
        {
          type: "bot",
          responses: [{ type: "text", text: "Line 1\\nLine 2" }],
        },
      ] as Message[];
      const transcript = convertMessagesToTranscriptText(messages);
      expect(transcript).toBe(
        "MAVEN TRANSCRIPT HISTORY\n\nMaven bot: Line 1\nLine 2",
      );
    });
  });

  describe("generateSessionInitRequestHeaders", () => {
    it("should generate correct headers with provided key and token", () => {
      const headers = generateSessionInitRequestHeaders(
        "test-key",
        "test-token",
      );
      expect(headers).toEqual({
        "X-LIVEAGENT-API-VERSION": SALESFORCE_API_VERSION,
        "X-LIVEAGENT-AFFINITY": "test-token",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-LIVEAGENT-SEQUENCE": "1",
        "X-LIVEAGENT-SESSION-KEY": "test-key",
      });
    });
  });

  describe("generateSessionInitRequestBody", () => {
    const baseParams = {
      buttonId: "test-button",
      chatSessionCredentials: {
        id: "test-session",
        key: "test-key",
        affinityToken: "test-token",
        clientPollTimeout: 30,
      } as ChatSessionResponse,
      deploymentId: "test-deployment",
      eswLiveAgentDevName: "test-dev-name",
      organizationId: "test-org",
      screenResolution: "1920x1080",
      sessionKey: "test-session-key",
      userAgent: "test-agent",
      userData: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      } as SalesforceChatUserData,
    };

    it("should generate request body with required fields", () => {
      const body = generateSessionInitRequestBody(baseParams);
      expect(body).toMatchObject({
        organizationId: "test-org",
        deploymentId: "test-deployment",
        buttonId: "test-button",
        sessionId: "test-session",
        visitorName: "John",
      });
    });

    it("should include optional user data fields when provided", () => {
      const body = generateSessionInitRequestBody({
        ...baseParams,
        userData: {
          ...baseParams.userData,
          locationId: "test-location",
          userId: "test-user",
          locationType: "test-type",
        } as SalesforceChatUserData,
      });

      const prechatDetails = body.prechatDetails.filter(Boolean);
      expect(prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "Location Id",
          value: "test-location",
        }),
      );
      expect(prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "User Id",
          value: "test-user",
        }),
      );
      expect(prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "Location Type",
          value: "test-type",
        }),
      );
    });

    it("should handle undefined optional fields", () => {
      const body = generateSessionInitRequestBody({
        ...baseParams,
        language: undefined,
        originalReferrer: undefined,
      });
      expect(body.language).toBeUndefined();
      expect(body.visitorInfo.originalReferrer).toBe("unknown");
    });

    it("should filter out null values from prechatDetails", () => {
      const body = generateSessionInitRequestBody({
        ...baseParams,
        userData: {
          firstName: "John",
          lastName: null as unknown as string,
          email: "john@example.com",
        },
      });

      expect(body.prechatDetails).not.toContainEqual(null);
      expect(body.prechatDetails.some((detail) => detail === null)).toBe(false);
      // Verify that null lastName didn't create a prechat detail
      expect(
        body.prechatDetails.find((detail) => detail?.label === "Last Name"),
      ).toBeUndefined();
    });
  });

  describe("fetchChatMessages", () => {
    const mockFetch = vi.fn();
    const url = "https://test.salesforce.com";
    const ack = 1;
    const affinityToken = "test-token";
    const sessionKey = "test-key";

    beforeEach(() => {
      global.fetch = mockFetch;
      mockFetch.mockReset();
    });

    it("should handle successful response", async () => {
      const mockResponse = {
        messages: [{ type: "ChatMessage", text: "Hello" }],
        sequence: 2,
        offset: 0,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchChatMessages(
        url,
        ack,
        affinityToken,
        sessionKey,
      );
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${url}/chat/rest/System/Messages?ack=${ack}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-LIVEAGENT-AFFINITY": affinityToken,
            "X-LIVEAGENT-SESSION-KEY": sessionKey,
          }),
        }),
      );
    });

    it("should handle 204 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await fetchChatMessages(
        url,
        ack,
        affinityToken,
        sessionKey,
      );
      expect(result).toEqual({
        messages: [],
        sequence: ack,
        offset: 0,
      });
    });

    it("should throw ChatMessagesError for non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        fetchChatMessages(url, ack, affinityToken, sessionKey),
      ).rejects.toThrow(ChatMessagesError);
    });
  });

  describe("ChatMessagesError", () => {
    it("creates error with status code", () => {
      const error = new ChatMessagesError("Test error", 500);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("ChatMessagesError");
    });
  });
});
