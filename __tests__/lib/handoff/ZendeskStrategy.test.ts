import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  afterAll,
} from "vitest";
import {
  ZendeskStrategy,
  ZendeskServerStrategy,
} from "@/src/lib/handoff/ZendeskStrategy";
import {
  createUserMessage,
  createBotMessage,
  createZendeskEvent,
} from "./test-utils";

// Store the original fetch implementation
const originalFetch = global.fetch;

// Mock fetch
global.fetch = vi.fn();

describe("ZendeskStrategy", () => {
  let strategy: ZendeskStrategy;

  beforeEach(() => {
    strategy = new ZendeskStrategy({
      type: "zendesk",
      enableAvailabilityCheck: true,
      handoffTerminatingMessageText: "Handoff terminating message text",
    });
  });

  describe("formatMessages", () => {
    it("formats user messages correctly", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "user" },
          content: { type: "text", text: "Hello" },
        },
      ]);
    });

    it("formats bot messages correctly", () => {
      const messages = [
        createBotMessage([
          { type: "text", text: "Hi" },
          { type: "text", text: " there" },
        ]),
      ];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "business" },
          content: { type: "text", text: "Hi there" },
        },
      ]);
    });
  });

  describe("handleChatEvent", () => {
    it("handles business author events", () => {
      const event = createZendeskEvent("business", "John Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "handoff-zendesk",
        timestamp: new Date(event.createdAt).getTime(),
      });
    });

    it("returns null for user author events", () => {
      const event = createZendeskEvent("user", "Ms. Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent).toBeNull();
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/zendesk/messages");
      expect(strategy.conversationsEndpoint).toBe("/api/zendesk/conversations");
    });
  });
});

describe("ZendeskServerStrategy", () => {
  let serverStrategy: ZendeskServerStrategy;
  const mockConfig: ZendeskHandoffConfiguration = {
    type: "zendesk",
    webhookId: "webhook-123",
    webhookSecret: "secret-123",
    subdomain: "test-subdomain",
    apiKey: "api-key-123",
    apiSecret: "api-secret-123",
    appId: "app-123",
    enableAvailabilityCheck: true,
    availabilityCheckApiEmail: "test@example.com",
    availabilityCheckApiToken: "api-token-123",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    serverStrategy = new ZendeskServerStrategy(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchHandoffAvailability", () => {
    it("returns true when availability check is disabled", async () => {
      const strategyWithDisabledCheck = new ZendeskServerStrategy({
        ...mockConfig,
        enableAvailabilityCheck: false,
      });

      const result = await strategyWithDisabledCheck.fetchHandoffAvailability();
      expect(result).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns true when API credentials are missing", async () => {
      const strategyWithMissingCredentials = new ZendeskServerStrategy({
        ...mockConfig,
        availabilityCheckApiEmail: undefined,
      });

      const result =
        await strategyWithMissingCredentials.fetchHandoffAvailability();
      expect(result).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns true when API request fails", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await serverStrategy.fetchHandoffAvailability();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("returns true when agents are available", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: "agent-1" }],
          }),
      });

      const result = await serverStrategy.fetchHandoffAvailability();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Verify the URL and headers
      const expectedUrl =
        `https://test-subdomain.zendesk.com` +
        `/api/v2/agent_availabilities` +
        `?filter[channel_status]=messaging:online` +
        `&select_channel=messaging`;

      const expectedEncodedKey = Buffer.from(
        `test@example.com/token:api-token-123`,
      ).toString("base64");

      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${expectedEncodedKey}`,
        },
      });
    });

    it("returns false when no agents are available", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
          }),
      });

      const result = await serverStrategy.fetchHandoffAvailability();
      expect(result).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("returns true when an error occurs during the API call", async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();
      (fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const result = await serverStrategy.fetchHandoffAvailability();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching handoff availability:",
        new Error("Network error"),
      );
      console.error = originalConsoleError;
    });
  });

  describe("isLiveHandoffAvailable", () => {
    it("returns a promise that resolves to true", async () => {
      const result = await serverStrategy.isLiveHandoffAvailable?.();
      expect(result).toBe(true);
    });
  });
});

// Restore the original fetch implementation after all tests
afterAll(() => {
  global.fetch = originalFetch;
});
