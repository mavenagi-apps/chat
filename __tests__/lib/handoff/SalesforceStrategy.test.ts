import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SalesforceStrategy,
  SalesforceServerStrategy,
} from "@/lib/handoff/SalesforceStrategy";
import {
  createUserMessage,
  createBotMessage,
  createSalesforceEvent,
  BotResponse,
} from "./test-utils";
import { SALESFORCE_MESSAGE_TYPES } from "@/types/salesforce";
import type { SalesforceChatRequestFail } from "@/types/salesforce";

describe("SalesforceStrategy", () => {
  let strategy: SalesforceStrategy;

  beforeEach(() => {
    strategy = new SalesforceStrategy({
      type: "salesforce",
      orgId: "test-org",
      chatHostUrl: "test-url",
      chatButtonId: "test-button",
      deploymentId: "test-deployment",
      eswLiveAgentDevName: "test-name",
      apiSecret: "test-secret",
    });
  });

  describe("formatMessages", () => {
    it("formats user messages correctly (passthrough)", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          type: "USER",
          text: "Hello",
          timestamp: 123456789,
        },
      ]);
    });

    it("formats bot messages correctly (passthrough)", () => {
      const responses: BotResponse[] = [
        { type: "text", text: "Hi" },
        { type: "text", text: " there" },
      ];
      const messages = [createBotMessage(responses)];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          botMessageType: "BOT_RESPONSE",
          conversationMessageId: {
            agentId: "agent-123",
            appId: "app-123",
            organizationId: "org-123",
            referenceId: "msg-123",
            type: "CONVERSATION_MESSAGE",
          },
          metadata: {
            followupQuestions: [],
            sources: [],
          },
          type: "bot",
          responses: [
            { type: "text", text: "Hi" },
            { type: "text", text: " there" },
          ],
          timestamp: 123456789,
        },
      ]);
    });
  });

  describe("handleChatEvent", () => {
    it("handles ChatTransferred events correctly", () => {
      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatTransferred,
        "John Agent",
      );

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: SALESFORCE_MESSAGE_TYPES.ChatTransferred,
        timestamp: expect.any(Number),
      });
    });

    it("handles ChatMessage events with agent name correctly", () => {
      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatMessage,
        "Jane Agent",
      );

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("Jane Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: SALESFORCE_MESSAGE_TYPES.ChatMessage,
        timestamp: expect.any(Number),
      });
    });

    it("returns null agent name for non-agent events", () => {
      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatRequestSuccess,
        "System",
      );

      const { agentName } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
    });

    it("returns shouldEndHandoff true for non-unavailable termination messages", () => {
      const event: SalesforceChatRequestFail = {
        type: SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
        message: {
          text: "Chat request failed",
          name: "System",
          schedule: {
            responseDelayMilliseconds: 0,
          },
          agentId: "system-1",
          reason: "Other",
          attachedRecords: [],
        },
      };
      const result = strategy.handleChatEvent(event);

      expect(result).toEqual({ shouldEndHandoff: true });
    });

    it("returns formatted event for unavailable termination messages", () => {
      const event: SalesforceChatRequestFail = {
        type: SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
        message: {
          text: "Chat request failed",
          name: "System",
          schedule: {
            responseDelayMilliseconds: 0,
          },
          agentId: "system-1",
          reason: "Unavailable",
          attachedRecords: [],
        },
      };
      const result = strategy.handleChatEvent(event);

      expect(result).toEqual({
        agentName: null,
        formattedEvent: {
          ...event,
          timestamp: expect.any(Number),
        },
        shouldEndHandoff: true,
      });
    });

    it("returns formatted event and agent name for non-termination messages", () => {
      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatMessage,
        "John Agent",
      );
      const result = strategy.handleChatEvent(event);

      expect(result).toEqual({
        agentName: "John Agent",
        formattedEvent: {
          ...event,
          timestamp: expect.any(Number),
        },
        shouldEndHandoff: false,
      });
    });

    it("ends handoff when message contains terminating text", () => {
      strategy = new SalesforceStrategy({
        type: "salesforce",
        orgId: "test-org",
        chatHostUrl: "test-url",
        chatButtonId: "test-button",
        deploymentId: "test-deployment",
        eswLiveAgentDevName: "test-name",
        apiSecret: "test-secret",
        handoffTerminatingMessageText: "goodbye",
      });

      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatMessage,
        "Agent",
        "Thanks for chatting, goodbye!",
      );

      const result = strategy.handleChatEvent(event);
      expect(result.shouldEndHandoff).toBe(true);
    });

    it("does not end handoff when terminating text is not present", () => {
      strategy = new SalesforceStrategy({
        type: "salesforce",
        orgId: "test-org",
        chatHostUrl: "test-url",
        chatButtonId: "test-button",
        deploymentId: "test-deployment",
        eswLiveAgentDevName: "test-name",
        apiSecret: "test-secret",
        handoffTerminatingMessageText: "goodbye",
      });

      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatMessage,
        "Agent",
        "How can I help you?",
      );

      const result = strategy.handleChatEvent(event);
      expect(result.shouldEndHandoff).toBe(false);
    });

    it("does not end handoff when terminating text is not configured", () => {
      const event = createSalesforceEvent(
        SALESFORCE_MESSAGE_TYPES.ChatMessage,
        "Agent",
        "Thanks for chatting, goodbye!",
      );

      const result = strategy.handleChatEvent(event);
      expect(result.shouldEndHandoff).toBe(false);
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/salesforce/messages");
      expect(strategy.conversationsEndpoint).toBe(
        "/api/salesforce/conversations",
      );
    });
  });
});

describe("SalesforceServerStrategy", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when availability check is disabled", async () => {
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: false,
    } as any);

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(true);
  });

  it("returns true on fetch error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any);

    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("returns true on non-200 response", async () => {
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any);

    mockFetch.mockResolvedValue({
      ok: false,
    });

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(true);
  });

  it("returns false when agents are not available", async () => {
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            {
              type: "Availability",
              message: {
                results: [
                  {
                    id: "button-id",
                    isAvailable: false,
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(false);
  });

  it("returns true when agents are available", async () => {
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            {
              type: "Availability",
              message: {
                results: [
                  {
                    id: "button-id",
                    isAvailable: true,
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(true);
  });

  it("returns true when no matching button ID is found", async () => {
    const strategy = new SalesforceServerStrategy({
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            {
              type: "Availability",
              message: {
                results: [
                  {
                    id: "different-button-id",
                    isAvailable: true,
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await strategy.fetchHandoffAvailability();
    expect(result).toBe(true);
  });

  it("verifies the correct URL and headers are used", async () => {
    const config = {
      type: "salesforce",
      enableAvailabilityCheck: true,
      chatHostUrl: "https://test.com",
      orgId: "org-id",
      deploymentId: "dep-id",
      chatButtonId: "button-id",
    } as any;

    const strategy = new SalesforceServerStrategy(config);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [] }),
    });

    await strategy.fetchHandoffAvailability();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        config.chatHostUrl + "/chat/rest/Visitor/Availability",
      ),
      expect.objectContaining({
        method: "GET",
        headers: {
          "X-LIVEAGENT-API-VERSION": expect.any(String),
        },
      }),
    );

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.searchParams.get("org_id")).toBe(config.orgId);
    expect(url.searchParams.get("deployment_id")).toBe(config.deploymentId);
    expect(url.searchParams.get("Availability.ids")).toBe(config.chatButtonId);
  });
});
