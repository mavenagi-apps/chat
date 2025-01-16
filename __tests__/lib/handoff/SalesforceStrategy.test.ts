import { describe, it, expect, beforeEach } from "vitest";
import { SalesforceStrategy } from "@/lib/handoff/SalesforceStrategy";
import {
  createUserMessage,
  createBotMessage,
  createSalesforceEvent,
} from "./test-helpers";
import {
  SALESFORCE_CHAT_SUBJECT_HEADER_KEY,
  SalesforceChatMessage,
} from "@/types/salesforce";
import { Message } from "@/types";

describe("SalesforceStrategy", () => {
  let strategy: SalesforceStrategy;

  beforeEach(() => {
    strategy = new SalesforceStrategy();
  });

  describe("formatMessages", () => {
    it("formats user messages correctly", () => {
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
      const messages = [createBotMessage([{ text: "Hi there" }])];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual(messages);
    });

    it("filters out non-USER and non-bot messages", () => {
      const messages = [
        createUserMessage("Hello"),
        { type: "SYSTEM", text: "System message" },
        createBotMessage([{ text: "Hi" }]),
      ];

      const formatted = strategy.formatMessages(
        messages as Message[],
        "conv-123",
      );
      expect(formatted).toHaveLength(2);
      expect(formatted.map((m) => m.type)).toEqual(["USER", "bot"]);
    });
  });

  describe("handleChatEvent", () => {
    it("handles ChatTransferred events correctly", () => {
      const event = createSalesforceEvent("ChatTransferred", {
        name: "John Agent",
        userId: "agent-123",
        sneakPeakEnabled: true,
        isTransferToBot: false,
      });

      const { agentName, formattedEvent } = strategy.handleChatEvent(
        event as SalesforceChatMessage,
      );
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toMatchObject({
        type: "ChatTransferred",
        message: {
          name: "John Agent",
          userId: "agent-123",
        },
      });
      expect(formattedEvent.timestamp).toBeDefined();
    });

    it("returns null agentName for non-ChatTransferred events", () => {
      const event = createSalesforceEvent("AgentTyping", {
        name: "John Agent",
        agentId: "agent-123",
      });

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent.type).toBe("AgentTyping");
    });
  });

  describe("showAgentTypingIndicator", () => {
    it("shows typing indicator for recent AgentTyping event", () => {
      const messages = [
        createUserMessage("Hello"),
        {
          type: "AgentTyping",
          timestamp: Date.now(),
          message: { name: "John", agentId: "123" },
        },
      ];

      expect(strategy.showAgentTypingIndicator(messages)).toBe(true);
    });

    it("hides typing indicator for AgentNotTyping event", () => {
      const messages = [
        createUserMessage("Hello"),
        {
          type: "AgentNotTyping",
          timestamp: Date.now(),
          message: { name: "John", agentId: "123" },
        },
      ];

      expect(strategy.showAgentTypingIndicator(messages)).toBe(false);
    });

    it("hides typing indicator for old events", () => {
      const messages = [
        createUserMessage("Hello"),
        {
          type: "AgentTyping",
          timestamp: Date.now() - 4000, // Older than 3 seconds
          message: { name: "John", agentId: "123" },
        },
      ];

      expect(strategy.showAgentTypingIndicator(messages)).toBe(false);
    });
  });

  describe("shouldSupressHandoffInputDisplay", () => {
    it("suppresses input when no agent is assigned", () => {
      expect(strategy.shouldSupressHandoffInputDisplay(null)).toBe(true);
    });

    it("shows input when agent is assigned", () => {
      expect(strategy.shouldSupressHandoffInputDisplay("John Agent")).toBe(
        false,
      );
    });
  });

  describe("endpoints and configuration", () => {
    it("has correct endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/salesforce/messages");
      expect(strategy.conversationsEndpoint).toBe(
        "/api/salesforce/conversations",
      );
    });

    it("has correct subject header key", () => {
      expect(strategy.subjectHeaderKey).toBe(
        SALESFORCE_CHAT_SUBJECT_HEADER_KEY,
      );
    });

    it("has correct connected message type", () => {
      expect(strategy.connectedToAgentMessageType).toBe("ChatConnecting");
    });
  });
});
